import { Table } from "@radix-ui/themes";

interface RepoTableProps {
  repos: string[] | undefined; // Change the type of repos to allow undefined
}

export const RepoTable: React.FC<RepoTableProps> = ({ repos }) => {
  if (repos === undefined || repos.length === 0) { // Check if repos is undefined or empty
    return (
      <div className="mx-10">
        <h1 className="text-xl font-bold mb-5">Linked Repositories</h1>
        <p>No linked Repos</p>
      </div>
    );
  }

  return (
    <div className="mx-10">
      <h1 className="text-xl font-bold mb-5">Linked Repositories</h1>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Repository Name</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {repos.map((repo, index) => (
            <Table.Row key={index}>
              <Table.RowHeaderCell>{repo}</Table.RowHeaderCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};
