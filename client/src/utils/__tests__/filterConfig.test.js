import { describe, it, expect, vi } from 'vitest';
import { buildFilterConfig } from '../filterConfig';

const URGENT = { id: 't1', name: 'Urgent', color: '#d93025' };
const READING = { id: 't2', name: 'Reading', color: '#188038' };
const WORK = { id: 'l1', name: 'Work' };

// The base config is the same for every test, so it is easier to spread it than to repeat it.
const base = { lists: [], allTags: [], tagsInList: [], listsForTag: [] };

describe('buildFilterConfig', () => {
  describe('with a list open', () => {
    it('offers that list’s tags, led by a reset option', () => {
      const cfg = buildFilterConfig({ ...base, activeListId: 'l1', tagsInList: [URGENT, READING] });

      expect(cfg.buttonLabel).toBe('Filter by tag');
      expect(cfg.groups[0].items.map((i) => i.label)).toEqual(['All tags', 'Urgent', 'Reading']);
    });

    it('names the active tag in the button once one is chosen', () => {
      const cfg = buildFilterConfig({
        ...base,
        activeListId: 'l1',
        tagsInList: [URGENT],
        tagFilter: 't1',
      });

      expect(cfg.buttonLabel).toBe('Tag: Urgent');
    });

    it('marks the reset option active only while nothing is filtered', () => {
      const unfiltered = buildFilterConfig({ ...base, activeListId: 'l1', tagsInList: [URGENT] });
      expect(unfiltered.groups[0].items[0].active).toBe(true);
      expect(unfiltered.groups[0].items[1].active).toBe(false);

      const filtered = buildFilterConfig({
        ...base,
        activeListId: 'l1',
        tagsInList: [URGENT],
        tagFilter: 't1',
      });
      expect(filtered.groups[0].items[0].active).toBe(false);
      expect(filtered.groups[0].items[1].active).toBe(true);
    });

    it('clears the filter when the reset option is picked', () => {
      const setTagFilter = vi.fn();
      const cfg = buildFilterConfig({
        ...base,
        activeListId: 'l1',
        tagsInList: [URGENT],
        setTagFilter,
      });

      cfg.groups[0].items[0].onSelect();
      expect(setTagFilter).toHaveBeenCalledWith(null);

      cfg.groups[0].items[1].onSelect();
      expect(setTagFilter).toHaveBeenCalledWith('t1');
    });

    // If a list has no tags, the menu is still shown so the user can reset the filter.
    it('offers nothing at all when the list has no tags', () => {
      const cfg = buildFilterConfig({ ...base, activeListId: 'l1', tagsInList: [] });
      expect(cfg.groups).toEqual([{ items: [] }]);
    });
  });

  describe('with a tag open', () => {
    it('offers the lists that tag reaches', () => {
      const cfg = buildFilterConfig({ ...base, activeTagId: 't1', listsForTag: [WORK] });

      expect(cfg.buttonLabel).toBe('Filter by list');
      expect(cfg.groups[0].items.map((i) => i.label)).toEqual(['All lists', 'Work']);
      expect(cfg.groups[0].items[1].type).toBe('list');
    });

    it('names the active list in the button once one is chosen', () => {
      const cfg = buildFilterConfig({
        ...base,
        activeTagId: 't1',
        listsForTag: [WORK],
        listFilter: 'l1',
      });

      expect(cfg.buttonLabel).toBe('List: Work');
    });
  });

  describe('with neither open', () => {
    it('browses lists and tags in separate labelled groups', () => {
      const cfg = buildFilterConfig({ ...base, lists: [WORK], allTags: [URGENT] });

      expect(cfg.buttonLabel).toBe('Browse lists & tags');
      expect(cfg.groups.map((g) => g.title)).toEqual([undefined, 'Lists', 'Tags']);
      expect(cfg.groups[0].items[0].label).toBe('All Drive Files');
      expect(cfg.groups[1].items.map((i) => i.label)).toEqual(['Work']);
      expect(cfg.groups[2].items.map((i) => i.label)).toEqual(['Urgent']);
    });

    // "All Drive Files" is the view being shown, so it is the active one.
    it('marks the all-files option as the active view', () => {
      const cfg = buildFilterConfig({ ...base, lists: [WORK], allTags: [URGENT] });
      expect(cfg.groups[0].items[0].active).toBe(true);
      expect(cfg.groups[1].items[0].active).toBe(false);
    });

    it('selects a list or a tag through the matching callback', () => {
      const onSelectList = vi.fn();
      const onSelectTag = vi.fn();
      const cfg = buildFilterConfig({
        ...base,
        lists: [WORK],
        allTags: [URGENT],
        onSelectList,
        onSelectTag,
      });

      cfg.groups[1].items[0].onSelect();
      expect(onSelectList).toHaveBeenCalledWith('l1');

      cfg.groups[2].items[0].onSelect();
      expect(onSelectTag).toHaveBeenCalledWith('t1');

      cfg.groups[0].items[0].onSelect();
      expect(onSelectList).toHaveBeenCalledWith(null);
    });
  });

  // A list being open takes precedence: the sidebar never has both at once,
  // but the branch order is what guarantees it.
  it('prefers the open list when both are somehow set', () => {
    const cfg = buildFilterConfig({
      ...base,
      activeListId: 'l1',
      activeTagId: 't1',
      tagsInList: [URGENT],
      listsForTag: [WORK],
    });

    expect(cfg.buttonLabel).toBe('Filter by tag');
  });
});
