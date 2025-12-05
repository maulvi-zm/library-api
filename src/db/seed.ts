import { db } from "./client";
import { books } from "./schema";

const authors = [
	"Jane Austen",
	"Charles Dickens",
	"Mark Twain",
	"Ernest Hemingway",
	"Virginia Woolf",
	"F. Scott Fitzgerald",
	"George Orwell",
	"J.K. Rowling",
	"Toni Morrison",
	"Gabriel García Márquez",
	"Haruki Murakami",
	"Chimamanda Ngozi Adichie",
	"Kazuo Ishiguro",
	"Margaret Atwood",
	"Salman Rushdie",
	"Zadie Smith",
	"Donna Tartt",
	"David Mitchell",
	"Colson Whitehead",
	"Jhumpa Lahiri",
	"Michael Chabon",
	"Jonathan Franzen",
	"Ann Patchett",
	"Barbara Kingsolver",
	"Louise Erdrich",
	"Alice Munro",
	"Raymond Carver",
	"Flannery O'Connor",
	"James Baldwin",
	"Ralph Ellison",
];

const bookTitles = [
	"The Great Adventure",
	"Echoes of Time",
	"Whispers in the Wind",
	"Shadows of the Past",
	"Dreams of Tomorrow",
	"Secrets Unveiled",
	"Journey to the Unknown",
	"Tales from the Heart",
	"Voices in the Dark",
	"Paths Less Traveled",
	"The Last Stand",
	"Breaking Free",
	"Finding Home",
	"Lost and Found",
	"Beyond the Horizon",
	"Under the Stars",
	"Through the Looking Glass",
	"Between the Lines",
	"Above the Clouds",
	"Beneath the Surface",
];

const descriptions = [
	"A captivating tale of adventure and discovery.",
	"An exploration of human nature and relationships.",
	"A story that will stay with you long after you finish reading.",
	"A beautifully written narrative that captures the essence of life.",
	"An engaging plot with well-developed characters.",
	"A thought-provoking examination of society and culture.",
	"A masterful work of literary fiction.",
	"A compelling story of love, loss, and redemption.",
	"An unforgettable journey through time and space.",
	"A powerful narrative that challenges conventional thinking.",
	"A richly detailed world brought to life through vivid prose.",
	"A story of courage and determination in the face of adversity.",
	"An intimate portrait of human experience.",
	"A tale that weaves together multiple perspectives.",
	"A literary masterpiece that explores deep themes.",
];

function generateBookName(index: number): string {
	const baseTitle = bookTitles[index % bookTitles.length];
	const suffix =
		index >= bookTitles.length
			? ` ${Math.floor(index / bookTitles.length) + 1}`
			: "";
	return `${baseTitle}${suffix}`;
}

function generateDescription(): string {
	return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generatePublishedYear(): number | null {
	// Random year between 1800 and 2024, with 10% chance of null
	if (Math.random() < 0.1) {
		return null;
	}
	return Math.floor(Math.random() * (2024 - 1800 + 1)) + 1800;
}

async function seed() {
	console.log("Starting database seeding...");

	try {
		const bookData = Array.from({ length: 200 }, (_, i) => ({
			name: generateBookName(i),
			author: authors[Math.floor(Math.random() * authors.length)],
			publishedYear: generatePublishedYear(),
			description: generateDescription(),
		}));

		console.log(`Inserting ${bookData.length} books...`);

		await db.insert(books).values(bookData);

		console.log(`Successfully seeded ${bookData.length} books!`);
		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
}

seed();
