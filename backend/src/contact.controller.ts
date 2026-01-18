import { Body, Controller, Get, Logger, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ContactService } from './contact.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class ContactController {
  private readonly logger = new Logger(ContactController.name)
  constructor(private readonly contactService: ContactService) { }


  @Get('account')
  async getAccountId() {
    return this.contactService.getAccountId()
  }
  @Get('contacts')
  async getContactsByAccount(@Query('accountId') accountId: string) {
    return this.contactService.getContactsByAccount(accountId)
  }
  @Post('upload-id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadId(@UploadedFile() file: Express.Multer.File, @Body('contactId') contactId: string) {
    this.logger.log("file:", file)
    
    this.logger.log("contactId:", contactId)

   
    return this.contactService.sendFileToSAP(file, contactId)

  }


}