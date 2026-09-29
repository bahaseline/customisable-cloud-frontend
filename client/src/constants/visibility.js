export const VISIBILITY = { PRIVATE: 'private', SHARED: 'shared' };

export const isShared = (tag) => tag.visibility === VISIBILITY.SHARED;
