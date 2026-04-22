import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AuthConfiguration } from './config/auth.configuration';

import * as fs from "fs"


@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)

  constructor(private readonly authConfig: AuthConfiguration) { }

  async getAccountId(accountId: string) {
    try {
      const res = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlAccount}?$filter=id eq ${accountId}`, {
        auth: {
          username: this.authConfig.user,
          password: this.authConfig.password
        }

      }

      )
      return res.data.value

    } catch (error: any) {
      this.logger.log("failed")

    }
  }

  async getContactsByAccount(accountId: string): Promise<any[]> {
    const baseUrl = this.authConfig.baseUrlSap;
    const contactsUrl = this.authConfig.urlContact;

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

        this.logger.log("url:", url);

        const results = await axios.get<{ value: any[] }>(url, {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          }
        });

        const data = results.data.value;

        allContacts = allContacts.concat(data);

        if (data.length < top) {
          hasMore = false;
        } else {
          skip += top;
        }
      }

      this.logger.log("Total contacts fetched:", allContacts.length);

      const residents = allContacts.filter(
        contact => contact?.functionalTitle === '007'
      );

      return residents;

    } catch (error) {
      this.logger.error("Error fetching contacts", error);
      throw error;
    }
  }

  async sendFileToSAP(file: any, contactId: string, field: string, fieldLabel: string, zIdNumber: string) {

    this.logger.log("file: ", file)
    const fileName = `${file.originalname.split(".")[0]}_${zIdNumber}.${file.originalname.split(".")[1]}`
    this.logger.log("fileName:", fileName)
    const ext = file.originalname.split(".")[1]
    try {
      const res = await axios.post(
        `${this.authConfig.baseUrlSap}/document-service/documents`,
        {
          // isSelected: false,
          // isDisplayDocument: true,
          fileName: fileName,
          category: "DOCUMENT",
          type: "10001",
          title: `${fieldLabel}.${ext}`

        },
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password,
          },
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      // this.logger.log("res:", res.data)
      const uploadUrl = res.data.value.uploadUrl
      // this.logger.log("uploadUrl:", uploadUrl)
      const attachment = res.data.value
      this.logger.log("attachment: ", attachment)

      await this.uploadFileToSAP(file, uploadUrl);
      fs.unlinkSync(file.path);



      const linkResponse = await this.linkAttachmentToContact(contactId, attachment, field);

      return { success: true, fieldLabel, attachmentId: attachment.id, linkResponse };
    } catch (error: any) {
      this.logger.error("failed request", error.response?.data || error.message)
    }
  }

  async uploadFileToSAP(file: any, uploadUrl: string) {
    try {
      const fileBuffer = fs.readFileSync(file.path)
      const response = await axios.put(uploadUrl, fileBuffer, {
        headers: {
          "Content-Type": file.mimetype,
          "Content-Length": file.size
        }
      });
      return response

    }
    catch (error: any) {
      this.logger.error("failed")
    }


  }
  async linkAttachmentToContact(contactId: string, attachment: any, field: string) {
    try {
      const getEtag = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password,
          }
        }
      )
      // this.logger.log("")
      const etag = getEtag.headers['etag'];
      this.logger.log("etag:", etag)
      // this.logger.log("headers:", getEtag)
      const patchRes = await axios.patch(
        `${this.authConfig.baseUrlSap}/contact-person-service/contactPersons/${contactId}`,
        {
          attachments: [
            { id: attachment.id }
          ],
          extensions: { [field]: "1" }
        },
        {
          headers: {
            "If-Match": etag,
            "Content-Type": "application/merge-patch+json"
          },
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          }
        }
      );

      return patchRes.data;

    } catch (error) {
      this.logger.error("failed to link attachment", error.response?.data || error.message);
      throw error;
    }
  }
  // downloadAllFiles(contactId: string) {
  //   const url = `${this.authConfig.baseUrlLink}/go/detail/mdcontact?nodeid=${contactId}`
  //    return { url }

  // }



  async deleteFileAndUpdateField(contactId: string, field: string) {
    try {
      const contact = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          }
        }
      )
      // this.logger.log("contact:", contact.data.value)

      const attachments = contact.data.value.attachments
      // this.logger.log("attacments:", attachments)
      const foundAttachment = attachments.find((file: any) => file.title.split(".")[0] === field)
      this.logger.log("foundAttachment: ", foundAttachment)
      const attachmentId = foundAttachment.id



      const res = await axios.delete(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}/attachments/${attachmentId}`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          }
        }
      )
      const updatedContact = await axios.get(
        `${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          }
        }
      )

      const newEtag = updatedContact.headers['etag']

      const updateField = await axios.patch(
        `${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
        {
          extensions: { [field]: "0" }
        },
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          },
          headers: {
            "If-Match": newEtag,
            "Content-Type": "application/merge-patch+json"
          }
        }
      )
      console.log("updateField: ", updateField.data)
      return { success: true, message: "the file was deleted successfully" }

    }
    catch (error: any) {
      console.log("error:", error)
    }


  }
}
