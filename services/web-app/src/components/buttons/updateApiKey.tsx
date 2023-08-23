import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import '../../styles/updateApiKey.css';


const UpdateAPIKey = () => (
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
            API Key
          </label>
          <input className="Input" id="key" defaultValue="**********************" />
        </fieldset>
        <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
          <Dialog.Close asChild>
            <button className="Button green">Save changes</button>
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

export default UpdateAPIKey;