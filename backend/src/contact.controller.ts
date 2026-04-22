import { Body, Controller, Delete, Get, Logger, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ContactService } from './contact.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class ContactController {
  private readonly logger = new Logger(ContactController.name)
  constructor(private readonly contactService: ContactService) { }


  @Get('account')
  async getAccountId(@Query('accountId') accountId: string) {
    return this.contactService.getAccountId(accountId)
  }
  @Get('contacts')
  async getContactsByAccount(@Query('accountId') accountId: string
   
  ) {
    return this.contactService.getContactsByAccount(accountId)
  }
  @Post('upload-id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadId(@UploadedFile() file: Express.Multer.File,
    @Body('contactId') contactId: string,
    @Body('field') field: string,
    @Body('fieldLabel') fieldLabel: string,
    @Body('zIdNumber') zIdNumber: string
  ) {
    this.logger.log("file:", file)
    this.logger.log("contactId:", contactId)
    this.logger.log("field:", field)
    this.logger.log("fieldLabel:", fieldLabel)
    this.logger.log("zIdNumber:", zIdNumber)


    return this.contactService.sendFileToSAP(file, contactId, field, fieldLabel, zIdNumber)

  }
  @Get('delete-file/:contactId/:field')
  async delete(
    @Param("contactId") contactId: string,
    @Param("field") field: string

  ) {
    return this.contactService.deleteFileAndUpdateField(contactId, field)
  }
  // @Get('download-all')
  // async downloadAll(
  //   @Query("contactId") contactId: string
  // ) {

  //   return this.contactService.downloadAllFiles(contactId);
  // }



}