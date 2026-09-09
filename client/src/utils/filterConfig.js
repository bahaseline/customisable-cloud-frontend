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

const asLabel = (tag) => ({ key: tag.id, label: tag.name, type: 'label', color: tag.color });
const asList = (list) => ({ key: list.id, label: list.name, type: 'list' });

export function buildFilterConfig({
  activeListId,
  activeTagId,
  lists,
  allTags,
  labelsInList,
  listsInLabel,
  labelFilter,
  setLabelFilter,
  listFilter,
  setListFilter,
  onSelectList,
  onSelectTag,
}) {
  if (activeListId) {
    const active = labelsInList.find((t) => t.id === labelFilter);
    return {
      buttonLabel: active ? `Label: ${active.name}` : 'Filter by label',
      groups: filterGroups({
        resetLabel: 'All labels',
        entities: labelsInList,
        activeId: labelFilter,
        onSelect: setLabelFilter,
        toItem: asLabel,
      }),
    };
  }

  if (activeTagId) {
    const active = listsInLabel.find((l) => l.id === listFilter);
    return {
      buttonLabel: active ? `List: ${active.name}` : 'Filter by list',
      groups: filterGroups({
        resetLabel: 'All lists',
        entities: listsInLabel,
        activeId: listFilter,
        onSelect: setListFilter,
        toItem: asList,
      }),
    };
  }

  return {
    buttonLabel: 'Browse lists & labels',
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
        title: 'Labels',
        items: allTags.map((t) => ({ ...asLabel(t), active: false, onSelect: () => onSelectTag(t.id) })),
      },
    ],
  };
}
