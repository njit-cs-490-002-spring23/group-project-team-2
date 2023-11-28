import { ConversationArea, Interactable, ViewingArea, GameArea, MafiaGameState } from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return interactable.type === 'ConversationArea';
}

/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return interactable.type === 'ViewingArea';
}

export function isMafiaArea(interactable: Interactable): interactable is GameArea<MafiaGameState> {
  return interactable.type === 'MafiaArea';
}
