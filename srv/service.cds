namespace srv;

service DocumentService {
  action uploadDocument(
    PSnumber     : String,
    Source       : String,
    DocumentName : String,
    File         : LargeBinary,
    FileType     : String
  ) returns  String
}
