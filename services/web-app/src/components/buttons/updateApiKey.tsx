import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import "../../styles/updateApiKey.css";

export interface UpdateAPIKeyProps {
  onSave: (apiKey: string) => void; // Define the interface for the onSave prop
}

const UpdateAPIKey: React.FC<UpdateAPIKeyProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState(""); // State to hold the API key input value

  const handleSave = () => {
    onSave(apiKey);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="Button violet ml-10 mb-7">Update Api Key</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Update Api Key</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Enter your new API Key here. Click save when you're done.
          </Dialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="key">
              New API Key
            </label>
            <input
              className="Input"
              id="key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </fieldset>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              justifyContent: "flex-end",
            }}
          >
            <Dialog.Close asChild>
              <button className="Button green" onClick={handleSave}>
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UpdateAPIKey;
