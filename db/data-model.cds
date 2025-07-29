namespace srv;


entity UploadedDocuments {
  key ID: UUID;
  hash: String;
  name: String;
  psNumber: String;
  source: String;
  createdAt: Timestamp;
}
