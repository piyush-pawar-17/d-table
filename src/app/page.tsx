import { Table } from '@/components';

import { generateFakeData } from '@/utils';

const Home = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
    const rowsParam = (await searchParams).rows as string;
    const rows = isNaN(Number(rowsParam)) ? 3000 : Number(rowsParam);

    const people = generateFakeData(rows);

    return (
        <main className="px-20 py-12">
            <header className="mb-10 text-center text-2xl">
                <h1>Dynamic table</h1>
            </header>

            <Table data={people} />
        </main>
    );
};

export default Home;
