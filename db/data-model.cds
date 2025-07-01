namespace srv;


entity UploadedDocuments {
  key hash     : String;
      name     : String;
      psNumber : String;
      source   : String;
      createdAt: Timestamp;
}