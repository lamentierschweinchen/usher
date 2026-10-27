// Chapters whose game has landed in games/<id>/game.js. Until an id is listed
// here the spine mounts a stub, so a missing file never costs a 404. Sealed
// chapters are never mounted (see `sealed` in story.js).
// For testing: ?games=none forces stubs, ?games=door,studio mounts only those,
// ?games=all tries every chapter's file.
export const LIVE = ['tarn', 'door', 'studio', 'burial', 'nights', 'trist', 'flight'];
