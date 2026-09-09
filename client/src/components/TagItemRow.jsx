import FileLinkRow from './FileLinkRow';

export default function TagItemRow({ item, parentListName }) {
  return <FileLinkRow to={`/file/${item.driveFileId}`} name={item.fileName} meta={parentListName} />;
}
