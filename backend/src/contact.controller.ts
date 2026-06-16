import {
  Body,
  Controller,
  Res,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { type Multer } from 'multer';

@Controller()
export class ContactController {
  private readonly logger = new Logger(ContactController.name);
  constructor(private readonly contactService: ContactService) {}

  @Get('account')
  async getAccountId(@Query('accountId') accountId: string) {
    return this.contactService.getAccountId(accountId);
  }
  @Get('contacts')
  async getContactsByAccount(@Query('accountId') accountId: string) {
    return this.contactService.getContactsByAccount(accountId);
  }
  // @Post('upload-id')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadId(@UploadedFile() file: Express.Multer.File,
  //   @Body('contactId') contactId: string,
  //   @Body('field') field: string,
  //   @Body('fieldLabel') fieldLabel: string,
  //   @Body('zIdNumber') zIdNumber: string
  // ) {
  //   this.logger.log("file:", file)
  //   this.logger.log("contactId:", contactId)
  //   this.logger.log("field:", field)
  //   this.logger.log("fieldLabel:", fieldLabel)
  //   this.logger.log("zIdNumber:", zIdNumber)

  //   return this.contactService.sendFileToSAP(file, contactId, field, fieldLabel, zIdNumber)

  // }
  @Post('upload-id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadId(
    @UploadedFile() file: Express.Multer.File,
    @Body('contactId') contactId: string,
    @Body('field') field: string,
    @Body('fieldLabel') fieldLabel: string,
    @Body('accountId') accountId: string,
  ) {
    this.logger.log('contactId:', contactId);
    this.logger.log('field:', field);
    this.logger.log('accountId:', accountId);

    return this.contactService.sendFileToSAP(
      file,
      contactId,
      field,
      fieldLabel,
      accountId,
    );
  }
  @Get('delete-file/:contactId/:field')
  async delete(
    @Param('contactId') contactId: string,
    @Param('field') field: string,
    // @Param('fieldLabel') fieldLabel: string,
    @Query('accountId') accountId: string,
  ) {
    return this.contactService.deleteFileAndUpdateField(
      contactId,
      field,
      accountId,
    );
  }

  @Get('download-zip')
  async downloadZip(
    @Query('accountId') accountId: string,
    @Query('filterType')
    filterType: 'all' | 'resident' | 'plot' | 'documentType',
    @Query('value') value: string,
    @Res() res: Response,
  ) {
    let zipBuffer: Buffer;

    switch (filterType) {
      case 'all':
        zipBuffer = await this.contactService.downloadAll(accountId);
        break;
      case 'resident':
        zipBuffer = await this.contactService.downloadByResident(
          accountId,
          value,
        );
        break;
      case 'plot':
        zipBuffer = await this.contactService.downloadByPlot(accountId, value);
        break;
      case 'documentType':
        zipBuffer = await this.contactService.downloadByDocumentType(
          accountId,
          value,
        );
        break;
      default:
        return res.status(400).json({ message: 'invalid filterType' });
    }

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="documents.zip"`,
    });
    res.send(zipBuffer);
  }
  @Get('download-file/:contactId/:field')
  async downloadFile(
    @Param('contactId') contactId: string,
    @Param('field') field: string,
    @Query('accountId') accountId: string,
    @Res() res: Response,
  ) {
    const { buffer, fileName } = await this.contactService.downloadSingleFile(
      accountId,
      contactId,
      field,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(buffer);
  }
  // @Get('download-all')
  // async downloadAll(
  //   @Query("contactId") contactId: string
  // ) {

  //   return this.contactService.downloadAllFiles(contactId);
  // }
}
