export const getDomainName = (stage: string): string | undefined => {
  switch (stage) {
    case "prod":
      return "oriontools.ai";
    case "staging":
      return "staging.oriontools.ai";
    default:
      return undefined;
  }
};
