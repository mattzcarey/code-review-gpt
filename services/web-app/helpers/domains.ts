export const getDomainName = (stage: string) => {
  switch (stage) {
    case "prod":
      return "oriontools.ai";
    case "staging":
      return "staging.oriontools.ai";
    default:
      return undefined;
  }
};
