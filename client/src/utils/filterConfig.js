function filterGroups({ resetLabel, entities, activeId, onSelect, toItem }) {
  if (entities.length === 0) return [{ items: [] }];
  return [
    {
      items: [
        { key: 'all', label: resetLabel, type: 'list', active: !activeId, onSelect: () => onSelect(null) },
        ...entities.map((entity) => ({
          ...toItem(entity),
          active: activeId === entity.id,
          onSelect: () => onSelect(entity.id),
        })),
      ],
    },
  ];
}

const asTag = (tag) => ({ key: tag.id, label: tag.name, type: 'tag', color: tag.color });
const asList = (list) => ({ key: list.id, label: list.name, type: 'list' });

export function buildFilterConfig({
  activeListId,
  activeTagId,
  lists,
  allTags,
  tagsInList,
  listsForTag,
  tagFilter,
  setTagFilter,
  listFilter,
  setListFilter,
  onSelectList,
  onSelectTag,
}) {
  if (activeListId) {
    const active = tagsInList.find((t) => t.id === tagFilter);
    return {
      buttonLabel: active ? `Tag: ${active.name}` : 'Filter by tag',
      groups: filterGroups({
        resetLabel: 'All tags',
        entities: tagsInList,
        activeId: tagFilter,
        onSelect: setTagFilter,
        toItem: asTag,
      }),
    };
  }

  if (activeTagId) {
    const active = listsForTag.find((l) => l.id === listFilter);
    return {
      buttonLabel: active ? `List: ${active.name}` : 'Filter by list',
      groups: filterGroups({
        resetLabel: 'All lists',
        entities: listsForTag,
        activeId: listFilter,
        onSelect: setListFilter,
        toItem: asList,
      }),
    };
  }

  return {
    buttonLabel: 'Browse lists & tags',
    groups: [
      {
        items: [
          {
            key: 'all',
            label: 'All Drive Files',
            type: 'list',
            active: true,
            onSelect: () => onSelectList(null),
          },
        ],
      },
      {
        title: 'Lists',
        items: lists.map((l) => ({ ...asList(l), active: false, onSelect: () => onSelectList(l.id) })),
      },
      {
        title: 'Tags',
        items: allTags.map((t) => ({ ...asTag(t), active: false, onSelect: () => onSelectTag(t.id) })),
      },
    ],
  };
}
