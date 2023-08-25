import React from "react";
import "../../styles/updateApiKey.css";
import { Button } from "@radix-ui/themes";

export interface UpdateAPIKeyProps {
  text: string;
  onClick?: () => void;
}

const BasicButton: React.FC<UpdateAPIKeyProps> = ({ text, onClick }) => {
  return (
    <Button
      className="font-light"
      highContrast
      color="gray"
      variant="solid"
      size="3"
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default BasicButton;
