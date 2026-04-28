export interface IErrorDefinition {
  message: string;
  statusCode: number;
  errorCode: string;
  category: "AUTH" | "RESOURCE" | "VALIDATION" | "SERVER" | "WALLET" | "AUCTION";
}
