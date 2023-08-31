import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import "../../styles/updateApiKey.css";
import BasicButton from "../buttons/basicButton";

export interface UpdateAPIKeyProps {
  onSave: (apiKey: string) => void;
}

const UpdateAPIKey: React.FC<UpdateAPIKeyProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    onSave(apiKey);
  };

  return (
    <div className="ml-10 mb-5">
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <BasicButton text="Update Api Key" />
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
                <button className="green" onClick={handleSave}>
                  Save Changes
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
    </div>
  );
};

export default UpdateAPIKey;
