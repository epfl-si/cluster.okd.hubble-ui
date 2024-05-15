import * as React from 'react';
import { useState } from 'react';

import {
  Dropdown,
  DropdownToggle,
  Form,
  FormGroup,
  Popover,
  TextInput
} from '@patternfly/react-core';

import BugIcon from '@patternfly/react-icons/dist/esm/icons/bug-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { t } from "../lib/translations";

import "./developer-token-controls.css";

export type DeveloperTokenControlsProps = {
  bearerToken: { set: (val : string) => void }
};

export const DeveloperTokenControls : React.FC<DeveloperTokenControlsProps> =
({ bearerToken }) => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const onToggle = (isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const toggle = <DropdownToggle id="developer-toggle" onToggle={onToggle}>
                   <BugIcon />
                 </DropdownToggle>;

  const contextualHelp = <Popover
                      headerContent={
                        <h3>Bearer token</h3>
                      }
                      bodyContent={
                        <div>
                          {t("Paste here the result of")}
                          <pre>oc whoami -t</pre>
                        </div>
                      }
                    >
                      <button
                        onClick={ (e) => e.preventDefault() }
                        className="pf-c-form__group-label-help"
                      >
                        <HelpIcon noVerticalAlign />
                      </button>
                    </Popover>;

  const fieldId = "developer-form-bearer-token",
        fieldLabel = t("Bearer token");

  return <div style={{position: "absolute", right: "0"}}>
           <Dropdown
             className="okd-epfl-hubble-ui__developer-tools"
             toggle={ toggle }
             isOpen={ isOpen }
           >
             <Form onSubmit={ (e) => e.preventDefault() }>
               <FormGroup label={ fieldLabel }
                       labelIcon={ contextualHelp }
                 fieldId={ fieldId }
                 isRequired>
                 <TextInput
                   isRequired
                   type="password"
                   id={ fieldId }
                   placeholder={"sha256~XXXXXXXXX"}
                   onChange={ (val) => bearerToken.set(val) }
                 />
               </FormGroup>
             </Form>
           </Dropdown>
         </div>;
}
