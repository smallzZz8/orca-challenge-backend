import { NetworkCode } from "./network";

export const sendResponse = (res: any, promise: Promise<any>) => {
  return promise
    .then((response) => {
      res.status(response?.code || NetworkCode.OK).send(response?.data);
    })
    .catch((error) => {
      res.status(NetworkCode.INTERNAL_SERVER_ERROR).send({
        error: "An error occurred",
        details: error,
      });
    });
};
