const fs = require('fs');
const faker = require('faker');
const data = [];

// console.log(faker.fake("{{name.lastName}}, {{name.firstName}} {{name.suffix}}"));
for (var i = 0; i < 100; i += 1) {
	const cells = [
		{value: faker.address.zipCode()},
		{value: faker.address.city()},
		{value: faker.address.cityPrefix()},
		{value: faker.address.citySuffix()},
		{value: faker.address.streetName()},
		{value: faker.address.streetAddress()},
		{value: faker.address.streetSuffix()},
		{value: faker.address.streetPrefix()},
		{value: faker.address.secondaryAddress()},
		{value: faker.address.county()},
		{value: faker.address.country()},
		{value: faker.address.countryCode()},
		{value: faker.address.state()},
		{value: faker.address.stateAbbr()},
		{value: faker.address.latitude()},
		{value: faker.address.longitude()},
		{value: faker.commerce.color()},
		{value: faker.commerce.department()},
		{value: faker.commerce.productName()},
		{value: faker.commerce.price()},
		{value: faker.commerce.productAdjective()},
		{value: faker.commerce.productMaterial()},
		{value: faker.commerce.product()},
		{value: faker.company.companyName()},
		{value: faker.company.companySuffix()},
		{value: faker.company.catchPhrase()},
		{value: faker.company.catchPhraseAdjective()},
		{value: faker.company.catchPhraseDescriptor()},
		{value: faker.company.catchPhraseNoun()},
		{value: faker.company.bs()},
		{value: faker.company.bsAdjective()},
		{value: faker.company.bsBuzz()},
		{value: faker.company.bsNoun()},
		{value: faker.helpers.randomize()}
	];
	data.push({
		id: 1001 + i,
		cells
	})
}

fs.writeFileSync('./src/sample/body.json', JSON.stringify(data, null, 4));
console.log('ok');
