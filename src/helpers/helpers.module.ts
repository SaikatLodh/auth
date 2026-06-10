import { Module } from "@nestjs/common";
import { FileUploadService } from "./file-upload.service";
import { MailService } from "./mail.service";

@Module({
    providers: [FileUploadService, MailService],
    exports: [FileUploadService, MailService]
})

export class HelpersModule { }