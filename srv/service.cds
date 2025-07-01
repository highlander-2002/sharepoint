using { srv.UploadedDocuments as ud} from '../db/data-model';

service MyService {

  entity UploadedDocuments as projection on ud ;

}
 
service DocumentService {
  action uploadDocument(
    PSnumber     : String,
    Source       : String,
    DocumentName : String,
    File         : LargeBinary,
    FileType     : String
  ) returns String;
}