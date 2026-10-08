import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AuthConfiguration } from './config/auth.configuration';
import archiver = require('archiver');

import * as fs from 'fs';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly authConfig: AuthConfiguration) {}

  async getAccountId(accountId: string) {
    try {
      const res = await axios.get(
        `${this.authConfig.baseUrlSap}/${this.authConfig.urlAccount}?$filter=id eq ${accountId}`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password,
          },
        },
      );
      return res.data.value;
    } catch (error: any) {
      this.logger.log('failed');
    }
  }

  async getContactsByAccount(accountId: string): Promise<any[]> {
    const baseUrl = this.authConfig.baseUrlSap;
    const contactsUrl = this.authConfig.urlContact;
    this.logger.log("accountId: ", accountId)

    let allContacts: any[] = [];
    const top = 999;
    let skip = 0;
    let hasMore = true;

    try {
      while (hasMore) {
        const url =
          `${baseUrl}/${contactsUrl}` +
          `?$filter=isContactPersonFor/accountId eq '${accountId}'` +
          `&$skip=${skip}` +
          `&$top=${top}`;

        this.logger.log('url:', url);

        const results = await axios.get<{ value: any[] }>(url, {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password,
          },
        });

        const data = results.data.value;

        allContacts = allContacts.concat(data);

        if (data.length < top) {
          hasMore = false;
        } else {
          skip += top;
        }
      }

      this.logger.log('Total contacts fetched:', allContacts.length);

      const residents = allContacts.filter(
        (contact) => contact?.functionalTitle === '0007',
      );

      return residents;
    } catch (error) {
      this.logger.error('Error fetching contacts', error);
      throw error;
    }
  }

  // async sendFileToSAP(file: any, contactId: string, field: string, fieldLabel: string, zIdNumber: string) {

  //   this.logger.log("file: ", file)
  //   const fileName = `${file.originalname.split(".")[0]}_${zIdNumber}.${file.originalname.split(".")[1]}`
  //   this.logger.log("fileName:", fileName)
  //   const ext = file.originalname.split(".")[1]
  //   try {
  //     const res = await axios.post(
  //       `${this.authConfig.baseUrlSap}/document-service/documents`,
  //       {
  //         // isSelected: false,
  //         // isDisplayDocument: true,
  //         fileName: fileName,
  //         category: "DOCUMENT",
  //         type: "10001",
  //         title: `${fieldLabel}.${ext}`

  //       },
  //       {
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password,
  //         },
  //         headers: {
  //           "Content-Type": "application/json"
  //         }
  //       }
  //     );
  //     // this.logger.log("res:", res.data)
  //     const uploadUrl = res.data.value.uploadUrl
  //     // this.logger.log("uploadUrl:", uploadUrl)
  //     const attachment = res.data.value
  //     this.logger.log("attachment: ", attachment)

  //     await this.uploadFileToSAP(file, uploadUrl);
  //     fs.unlinkSync(file.path);

  //     const linkResponse = await this.linkAttachmentToContact(contactId, attachment, field);

  //     return { success: true, fieldLabel, attachmentId: attachment.id, linkResponse };
  //   } catch (error: any) {
  //     this.logger.error("failed request", error.response?.data || error.message)
  //   }
  // }

  // async uploadFileToSAP(file: any, uploadUrl: string) {
  //   try {
  //     const fileBuffer = fs.readFileSync(file.path)
  //     const response = await axios.put(uploadUrl, fileBuffer, {
  //       headers: {
  //         "Content-Type": file.mimetype,
  //         "Content-Length": file.size
  //       }
  //     });
  //     return response

  //   }
  //   catch (error: any) {
  //     this.logger.error("failed")
  //   }

  // }
  // async linkAttachmentToContact(contactId: string, attachment: any, field: string) {
  //   try {
  //     const getEtag = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
  //       {
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password,
  //         }
  //       }
  //     )
  //     // this.logger.log("")
  //     const etag = getEtag.headers['etag'];
  //     this.logger.log("etag:", etag)
  //     // this.logger.log("headers:", getEtag)
  //     const patchRes = await axios.patch(
  //       `${this.authConfig.baseUrlSap}/contact-person-service/contactPersons/${contactId}`,
  //       {
  //         attachments: [
  //           { id: attachment.id }
  //         ],
  //         extensions: { [field]: "1" }
  //       },
  //       {
  //         headers: {
  //           "If-Match": etag,
  //           "Content-Type": "application/merge-patch+json"
  //         },
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password
  //         }
  //       }
  //     );

  //     return patchRes.data;

  //   } catch (error: any) {
  //     this.logger.error("failed to link attachment", error.response?.data || error.message);
  //     throw error;
  //   }
  // }
  // downloadAllFiles(contactId: string) {
  //   const url = `${this.authConfig.baseUrlLink}/go/detail/mdcontact?nodeid=${contactId}`
  //    return { url }

  // }

 
  private async buildBlobPath(
    accountId: string,
    contactId: string,
    documentName: string,
  ): Promise<string> {
    const prefix = await this.buildContactPrefix(accountId, contactId);

    return `${prefix}${encodeURIComponent(documentName)}`;
  }

  private buildAzureUrl(blobPath: string): string {
    const StorageAccountName = this.authConfig.azureStorageAccount;
    const ContainerName = this.authConfig.azureContainer;
    const sapToken = this.authConfig.azureSasToken;
    return `https://${StorageAccountName}.blob.core.windows.net/${ContainerName}/${blobPath}?${sapToken}`;
  }

  async uploadFileToAzure(
    file: Express.Multer.File,
    accountId: string,
    contactId: string,
    documentName: string,
  ): Promise<string> {
    const blobPath = await this.buildBlobPath(
      accountId,
      contactId,
      documentName,
    );
    const blobUrl = this.buildAzureUrl(blobPath);
    const fileBuffer = fs.readFileSync(file.path);

    try {
      await axios.put(blobUrl, fileBuffer, {
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.mimetype,
          'Content-Length': file.size,
        },
      });

      this.logger.log('uploaded to azure:', blobPath);
      return blobPath;
    } catch (error: any) {
      this.logger.error(
        'failed to upload to azure',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async sendFileToSAP(
    file: any,
    contactId: string,
    field: string,
    fieldLabel: string,
    accountId: string,
  ) {
    this.logger.log('file: ', file);

    const ext = file.originalname.split('.').pop().toLowerCase();
    const documentName = `${field}.${ext}`;

    try {
      const blobPath = await this.uploadFileToAzure(
        file,
        accountId,
        contactId,
        documentName,
      );

      fs.unlinkSync(file.path);

      const updateResponse = await this.updateContactField(
        contactId,
        field,
        '1',
      );

      return { success: true, fieldLabel, blobPath, updateResponse };
    } catch (error: any) {
      this.logger.error(
        'failed request',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async updateContactField(contactId: string, field: string, value: '0' | '1') {
    try {
      const getEtag = await axios.get(
        `${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password,
          },
        },
      );
      const etag = getEtag.headers['etag'];

      const patchRes = await axios.patch(
        `${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
        {
          extensions: { [field]: value },
        },
        {
          headers: {
            'If-Match': etag,
            'Content-Type': 'application/merge-patch+json',
          },
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password,
          },
        },
      );

      return patchRes.data;
    } catch (error: any) {
      this.logger.error(
        'failed to update contact field',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async deleteFileAndUpdateField(
    contactId: string,
    field: string,
    accountId: string,
    ext: string = 'pdf',
  ) {
    try {
      const documentName = `${field}.${ext}`;
      this.logger.log('docname: ', documentName);
      const blobPath = await this.buildBlobPath(
        accountId,
        contactId,
        documentName,
      );
      const blobUrl = this.buildAzureUrl(blobPath);

      await axios.delete(blobUrl);
      this.logger.log('deleted from azure:', blobPath);

      await this.updateContactField(contactId, field, '0');

      return { success: true, message: 'the file was deleted successfully' };
    } catch (error: any) {
      this.logger.error(
        'failed to delete',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
  //delete from sap v2

  // async deleteFileAndUpdateField(contactId: string, field: string) {
  //   try {
  //     const contact = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
  //       {
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password
  //         }
  //       }
  //     )
  //     // this.logger.log("contact:", contact.data.value)
  
  //     const attachments = contact.data.value.attachments
  //     // this.logger.log("attacments:", attachments)
  //     const foundAttachment = attachments.find((file: any) => file.title.split(".")[0] === field)
  //     this.logger.log("foundAttachment: ", foundAttachment)
  //     const attachmentId = foundAttachment.id

  //     const res = await axios.delete(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}/attachments/${attachmentId}`,
  //       {
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password
  //         }
  //       }
  //     )
  //     const updatedContact = await axios.get(
  //       `${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
  //       {
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password
  //         }
  //       }
  //     )

  //     const newEtag = updatedContact.headers['etag']

  //     const updateField = await axios.patch(
  //       `${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
  //       {
  //         extensions: { [field]: "0" }
  //       },
  //       {
  //         auth: {
  //           username: this.authConfig.user,
  //           password: this.authConfig.password
  //         },
  //         headers: {
  //           "If-Match": newEtag,
  //           "Content-Type": "application/merge-patch+json"
  //         }
  //       }
  //     )
  //     console.log("updateField: ", updateField.data)
  //     return { success: true, message: "the file was deleted successfully" }

  //   }
  //   catch (error: any) {
  //     console.log("error:", error)
  //   }

  // }
  private async getAccountAndContactNames(
    accountId: string,
    contactId?: string,
  ) {
    const account = await this.getAccountId(accountId);

    if (!account?.length) {
      throw new Error(`Account ${accountId} not found`);
    }

    const accName = account[0].formattedName;

    let contactName: string | undefined;

    if (contactId) {
      contactName = account[0].hasContactPersons.find(
        (c: any) => c.contactId === contactId,
      )?.contactFormattedName;

      if (!contactName) {
        throw new Error(`Contact ${contactId} not found`);
      }
    }

    return { accName, contactName };
  }
  private async buildAccountPrefix(accountId: string): Promise<string> {
    const { accName } = await this.getAccountAndContactNames(accountId);

    return `${accountId}_${accName}/`;
  }
  private async buildContactPrefix(
    accountId: string,
    contactId: string,
  ): Promise<string> {
    const { accName, contactName } = await this.getAccountAndContactNames(
      accountId,
      contactId,
    );

   return `${accountId}_${accName}/${contactId}_${contactName}/`;
  }

  private async listBlobs(prefix: string): Promise<string[]> {
    const account = this.authConfig.azureStorageAccount;
    const container = this.authConfig.azureContainer;
    const sasToken = this.authConfig.azureSasToken;

    const url =
      `https://${account}.blob.core.windows.net/${container}` +
      `?restype=container&comp=list&prefix=${encodeURIComponent(prefix)}&${sasToken}`;

    const res = await axios.get(url, { responseType: 'text' });

    const names: string[] = [];
    const regex = /<Name>(.*?)<\/Name>/g;
    let match;
    while ((match = regex.exec(res.data)) !== null) {
      names.push(match[1]);
    }
    return names;
  }

  private async downloadBlob(blobPath: string): Promise<Buffer> {
    const blobUrl = this.buildAzureUrl(blobPath);
    const res = await axios.get(blobUrl, { responseType: 'arraybuffer' });
    return Buffer.from(res.data);
  }

  private async createZip(blobPaths: string[]): Promise<Buffer> {
    const archive = (archiver as any)('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => chunks.push(chunk));

    const done = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);
    });

    for (const blobPath of blobPaths) {
      try {
        const fileBuffer = await this.downloadBlob(blobPath);

        const fileName = blobPath.split('/').pop() || 'file';
        archive.append(fileBuffer, { name: fileName });
      } catch (error: any) {
        this.logger.warn(`skipping ${blobPath}: ${error.message}`);
      }
    }

    await archive.finalize();
    return done;
  }


  async downloadAll(accountId: string): Promise<Buffer> {
    const prefix = await this.buildAccountPrefix(accountId);

    const blobPaths = await this.listBlobs(prefix);

    if (blobPaths.length === 0) {
      throw new Error('no files found for this project');
    }

    return this.createZip(blobPaths);
  }

 
  async downloadByResident(
    accountId: string,
    contactId: string,
  ): Promise<Buffer> {
    const prefix = await this.buildContactPrefix(accountId, contactId);

    const blobPaths = await this.listBlobs(prefix);

    if (blobPaths.length === 0) {
      throw new Error('no files found for this resident');
    }

    return this.createZip(blobPaths);
  }

  async downloadByPlot(accountId: string, plot: string): Promise<Buffer> {
    const allContacts = await this.getContactsByAccount(accountId);
    const contactsInPlot = allContacts.filter(
      (c) => c?.extensions?.Z_Part === plot,
    );

    if (contactsInPlot.length === 0) {
      throw new Error('no residents found in this plot');
    }

    let allBlobPaths: string[] = [];
    for (const contact of contactsInPlot) {
      const prefix = await this.buildContactPrefix(accountId, contact.id);

      const paths = await this.listBlobs(prefix);

      allBlobPaths = allBlobPaths.concat(paths);
    }

    if (allBlobPaths.length === 0) {
      throw new Error('no files found for residents in this plot');
    }

    this.logger.log(`zipping ${allBlobPaths.length} files for plot ${plot}`);
    return this.createZip(allBlobPaths);
  }

 
  async downloadByDocumentType(
    accountId: string,
    field: string,
  ): Promise<Buffer> {
    const prefix = await this.buildAccountPrefix(accountId);

    const allBlobPaths = await this.listBlobs(prefix);

    const matchingPaths = allBlobPaths.filter((path) => {
      const fileName = path.split('/').pop() || '';
      return fileName.startsWith(`${field}.`);
    });

    if (matchingPaths.length === 0) {
      throw new Error('no files found for this document type');
    }

    return this.createZip(matchingPaths);
  }

  async downloadSingleFile(
    accountId: string,
    contactId: string,
    field: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const prefix = await this.buildContactPrefix(accountId, contactId);

    const blobPaths = await this.listBlobs(prefix);

    const target = blobPaths.find((path) => {
      const fileName = path.split('/').pop() || '';
      return fileName.startsWith(`${field}.`);
    });

    if (!target) {
      throw new Error(`no file found for field ${field}`);
    }

    const buffer = await this.downloadBlob(target);
    const fileName = target.split('/').pop() || 'file';

    return { buffer, fileName };
  }
}
