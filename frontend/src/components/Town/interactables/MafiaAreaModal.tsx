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
  import React, { useCallback, useEffect, useState } from 'react';
  import useTownController from '../../../hooks/useTownController';
  import { useInteractable } from '../../../classes/TownController';
  import MafiaAreaInteractable from './MafiaArea';

  export default function MafiaAreaModal(): JSX.Element {
    const coveyTownController = useTownController();
    const mafiaArea = useInteractable<MafiaAreaInteractable>('mafiaArea');
    
    const isOpen = mafiaArea !== undefined;

    useEffect(() => {
        if (mafiaArea) {
          coveyTownController.pause();
        } else {
          coveyTownController.unPause();
        }
    }, [coveyTownController, mafiaArea]);

    const closeModal = useCallback(() => {
        if (mafiaArea) {
          coveyTownController.interactEnd(mafiaArea);
        }
      }, [coveyTownController, mafiaArea]);

    const onClose = () => {
        closeModal();
        coveyTownController.unPause();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {mafiaArea?.getData('type')}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Join this game of mafia?
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme='blue' mr={3} onClick={onClose}>Yes</Button>
                    <Button colorScheme='red' mr={3} onClick={onClose}>No</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
  }