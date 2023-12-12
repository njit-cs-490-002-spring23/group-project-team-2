import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import useTownController from '../../../hooks/useTownController';
import { useInteractable } from '../../../classes/TownController';
import PromptTransporterInteractable from './PromptTransporter';

export default function PromptTransporterModal(): JSX.Element {
  const coveyTownController = useTownController();
  const transportPrompt = useInteractable<PromptTransporterInteractable>('promptTransporter');

  const isOpen = transportPrompt !== undefined;

  useEffect(() => {
    if (transportPrompt) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, transportPrompt]);

  const closeModal = useCallback(() => {
    if (transportPrompt) {
      coveyTownController.interactEnd(transportPrompt);
    }
  }, [coveyTownController, transportPrompt]);

  const onClose = () => {
    closeModal();
    coveyTownController.unPause();
  };

  const onTransport = () => {
    transportPrompt?.transport();
    //coveyTownController.ourPlayer.setSkin = transportPrompt?.destinationType() as string;
    onClose();
  };

  transportPrompt?.overlapExit();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{transportPrompt?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{transportPrompt?.getData('promptText')}</ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={onTransport}>
            Yes
          </Button>
          <Button colorScheme='red' mr={3} onClick={onClose}>
            No
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
