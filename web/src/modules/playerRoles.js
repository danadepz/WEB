// Player role options per game title. Shared by the admin roster manager
// and the public OIC registration form.
export const PLAYER_ROLES = {
  mlbb: ['Core', 'Mid', 'Exp', 'Gold', 'Roam', 'Flex', 'Sub'],
  valorant: ['Controller', 'Duelist', 'Sentinel', 'Initiator', 'Flex', 'Sub'],
};

export const playerRolesFor = (game) =>
  PLAYER_ROLES[game === 'valorant' ? 'valorant' : 'mlbb'];

// Starting roles exclude the substitute slot.
export const starterRolesFor = (game) =>
  playerRolesFor(game).filter((role) => role !== 'Sub');
