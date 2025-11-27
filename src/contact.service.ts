import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AuthConfiguration } from './config/auth.configuration';
import * as fs from "fs"

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)

  constructor(private readonly authConfig: AuthConfiguration) { }

  async getAccountId() {
    try {
      const res = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlAccount}?$filter=formattedName eq 'Arral Energy DE'`, {
        auth: {
          username: this.authConfig.user,
          password: this.authConfig.password
        }

      }

      )
      return res.data

    } catch (error: any) {
      this.logger.log("failed")

    }
  }
  
  async getContactsByAccount() {
    try {
      // const getSpesificAccount = await this.getAccountId()
      // const accountId = getSpesificAccount.Value[0].id
      // this.logger.log("accountId", accountId)

      // const accountId = "0196e7ec-f617-7001-8666-1aecd515ffc8"
      // const accountId = "0196be43-d44b-7000-8417-983b288d00d6"
      const accountId =  "11ed6655-d1b3-643e-afdb-81dbbb010a00"

      const contactsByAccount = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}?$filter=accountId eq '${accountId}'`,
        {
          auth: {
            username: this.authConfig.user,
            password: this.authConfig.password
          }

        }
      )
      // להוסיף שדה hasId 
      //formattedName שם מלא בשדה של האיש קשר
      return contactsByAccount.data.value


    }
    catch (error: any) {
      this.logger.log("Failed")
    }
  }
  
  async sendFileToSAP(file: any, contactId: string) {
    
    try {
      const res = await axios.post(
        `${this.authConfig.baseUrlSap}/document-service/documents`,
        {
          isSelected: false,
          isDisplayDocument: true,
          fileName: file.originalname,
          category: "DOCUMENT",
          type: "10001"
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
      this.logger.log("res:", res.data)
      const uploadUrl = res.data.value.uploadUrl
      this.logger.log("uploadUrl:", uploadUrl)
      const attachment = res.data.value

     await this.uploadFileToSAP(file, uploadUrl);
     fs.unlinkSync(file.path); 


    
    const linkResponse = await this.linkAttachmentToContact(contactId, attachment.id);

    return { success: true, attachmentId: attachment.id, linkResponse};
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
    catch(error:any){
      this.logger.error("failed")
    }
    

  }
async linkAttachmentToContact(contactId: string, attachmentId: string) {
  try {
    const getEtag = await axios.get(`${this.authConfig.baseUrlSap}/${this.authConfig.urlContact}/${contactId}`,
       {
        auth: {
          username: this.authConfig.user,
          password: this.authConfig.password,
        }
      }
    )
    const etag = getEtag.headers['etag'];
    this.logger.log("etag:", etag)
    this.logger.log("headers:", getEtag)
    const patchRes = await axios.patch(
      `${this.authConfig.baseUrlSap}/contact-person-service/contactPersons/${contactId}`,
      {
        attachments: [
          { id: attachmentId}
        ],
        extensions: { TZ: true }
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

}
