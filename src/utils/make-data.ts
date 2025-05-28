import { faker } from '@faker-js/faker';

export interface Person {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle: string;
}

export function generateFakeData(count: number) {
    const generated: Person[] = [];

    const firstNames: string[] = [];
    const lastNames: string[] = [];
    const companyNames: string[] = [];

    for (let i = 0; i < 500; i++) {
        firstNames.push(faker.person.firstName());
        lastNames.push(faker.person.lastName());
        companyNames.push(faker.company.name());
    }

    for (let i = 0; i < count; i++) {
        generated.push({
            id: i + 1,
            firstName: faker.helpers.arrayElement(firstNames),
            lastName: faker.helpers.arrayElement(lastNames),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            company: faker.helpers.arrayElement(companyNames),
            jobTitle: faker.person.jobTitle()
        });
    }

    return generated;
}
