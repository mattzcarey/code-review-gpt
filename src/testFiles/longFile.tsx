/* eslint-disable */
// Import necessary modules
import { useState } from "react";

// Define the interface for the form data
interface FormData {
  name: string;
  age: string;
  dateOfBirth: string;
  streetAddress: string;
  city: string;
  country: string;
  postCode: string;
  favouriteDog: string;
  favouriteCat: string;
  lastMovie: string;
  lastBook: string;
  dreamVacation: string;
  favouriteTree: string;
  favouriteFood: string;
  dreamJob: string;
  favoriteColor: string;
  hobby: string;
  carBrand: string;
  movieGenre: string;
  musicGenre: string;
  favoriteSport: string;
  favoriteArtist: string;
  dreamCity: string;
  favoriteHoliday: string;
  bestFriend: string;
  favoriteBookGenre: string;
  favoriteSeason: string;
}

// Define the initial form data
const initialFormData: FormData = {
  name: "",
  age: "",
  dateOfBirth: "",
  streetAddress: "",
  city: "",
  country: "",
  postCode: "",
  favouriteDog: "",
  favouriteCat: "",
  lastMovie: "",
  lastBook: "",
  dreamVacation: "",
  favouriteTree: "",
  favouriteFood: "",
  dreamJob: "",
  favoriteColor: "",
  hobby: "",
  carBrand: "",
  movieGenre: "",
  musicGenre: "",
  favoriteSport: "",
  favoriteArtist: "",
  dreamCity: "",
  favoriteHoliday: "",
  bestFriend: "",
  favoriteBookGenre: "",
  favoriteSeason: "",
};

// Define the interface for an item
interface Item {
  id: number;
  name: string;
  checked: boolean;
}

// Define the component
const LongForm = () => {
  // Initialize state
  const [formData, setFormData] = useState<FormData>(initialFormData);
  // Add a state variable for the count
  const [count, setCount] = useState(0);
  // Add a state variable for the toggle
  const [isToggled, setIsToggled] = useState(false);

  // Define a state variable for the rating
  const [rating, setRating] = useState<number | null>(null);

  // Define a state variable for the items
  const [items, setItems] = useState<Item[]>([]);
  // Define a state variable for the new item name
  const [newItemName, setNewItemName] = useState("");

  // Handle input changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // Add a function to increment the count
  const incrementCount = () => {
    setCount(count + 1);
  };

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  // Define a function to handle the rating change
  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRating(Number(event.target.value));
  };

  // Define a function to add a new item
  const addNewItem = () => {
    setItems([
      ...items,
      { id: items.length, name: newItemName, checked: false },
    ]);
    setNewItemName("");
  };

  // Define a function to handle the change of the new item name
  const handleNewItemNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewItemName(event.target.value);
  };

  // Define a function to handle the change of an item's checked state
  const handleItemCheckedChange = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Render the component
  return (
    <div className="space-y-4">
      <form className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            Age
          </label>
          <input
            type="number"
            name="age"
            id="age"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="dateOfBirth"
            className="block text-sm font-medium text-gray-700"
          >
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="streetAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Street Address
          </label>
          <input
            type="text"
            name="streetAddress"
            id="streetAddress"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <input
            type="text"
            name="country"
            id="country"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="postCode"
            className="block text-sm font-medium text-gray-700"
          >
            Post Code
          </label>
          <input
            type="text"
            name="postCode"
            id="postCode"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favouriteDog"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Dog
          </label>
          <input
            type="text"
            name="favouriteDog"
            id="favouriteDog"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favouriteCat"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Cat
          </label>
          <input
            type="text"
            name="favouriteCat"
            id="favouriteCat"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="lastMovie"
            className="block text-sm font-medium text-gray-700"
          >
            Last Movie You Saw
          </label>
          <input
            type="text"
            name="lastMovie"
            id="lastMovie"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="lastBook"
            className="block text-sm font-medium text-gray-700"
          >
            Last Book You Read
          </label>
          <input
            type="text"
            name="lastBook"
            id="lastBook"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="dreamVacation"
            className="block text-sm font-medium text-gray-700"
          >
            Dream Vacation
          </label>
          <input
            type="text"
            name="dreamVacation"
            id="dreamVacation"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favouriteTree"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Tree
          </label>
          <input
            type="text"
            name="favouriteTree"
            id="favouriteTree"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favouriteFood"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Food
          </label>
          <input
            type="text"
            name="favouriteFood"
            id="favouriteFood"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="dreamJob"
            className="block text-sm font-medium text-gray-700"
          >
            Dream Job
          </label>
          <input
            type="text"
            name="dreamJob"
            id="dreamJob"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="hobby"
            className="block text-sm font-medium text-gray-700"
          >
            Hobby
          </label>
          <input
            type="text"
            name="hobby"
            id="hobby"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="carBrand"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Car Brand
          </label>
          <input
            type="text"
            name="carBrand"
            id="carBrand"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="movieGenre"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Movie Genre
          </label>
          <input
            type="text"
            name="movieGenre"
            id="movieGenre"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="musicGenre"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Music Genre
          </label>
          <input
            type="text"
            name="musicGenre"
            id="musicGenre"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favoriteSport"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Sport
          </label>
          <input
            type="text"
            name="favoriteSport"
            id="favoriteSport"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favoriteArtist"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Artist
          </label>
          <input
            type="text"
            name="favoriteArtist"
            id="favoriteArtist"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favoriteSeason"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Season
          </label>
          <input
            type="text"
            name="favoriteSeason"
            id="favoriteSeason"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favoriteBookGenre"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Book Genre
          </label>
          <input
            type="text"
            name="favoriteBookGenre"
            id="favoriteBookGenre"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favoriteHoliday"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Holiday
          </label>
          <input
            type="text"
            name="favoriteHoliday"
            id="favoriteHoliday"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="bestFriend"
            className="block text-sm font-medium text-gray-700"
          >
            Best Friend
          </label>
          <input
            type="text"
            name="bestFriend"
            id="bestFriend"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="dreamCity"
            className="block text-sm font-medium text-gray-700"
          >
            Dream City
          </label>
          <input
            type="text"
            name="dreamCity"
            id="dreamCity"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="favoriteColor"
            className="block text-sm font-medium text-gray-700"
          >
            Favourite Color
          </label>
          <select
            name="favoriteColor"
            id="favoriteColor"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a color</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
          </select>
        </div>
        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>
          </div>
        </div>
        <div>
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700"
          >
            Rate this form
          </label>
          <select
            name="rating"
            id="rating"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            value={rating || ""}
            onChange={handleRatingChange}
          >
            <option value="">Select a rating</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        // Add a message that changes depending on the rating
        {rating && (
          <div>
            <h2>Thank you for your rating!</h2>
            {rating >= 4 ? (
              <p>We're glad that you like our form!</p>
            ) : (
              <p>We're sorry to hear that. We'll try to improve our form.</p>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            className="mt-3 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </form>

      <button onClick={incrementCount}>Increment Count</button>
      <div>Count: {count}</div>

      <button onClick={handleToggle}>Toggle Text</button>
      <p>{isToggled ? "The toggle is on." : "The toggle is off."}</p>

      {items.map((item) => (
        <div key={item.id}>
          <input
            type="checkbox"
            id={`item-${item.id}`}
            checked={item.checked}
            onChange={() => handleItemCheckedChange(item.id)}
          />
          <label htmlFor={`item-${item.id}`}>{item.name}</label>
        </div>
      ))}
      <input
        type="text"
        value={newItemName}
        onChange={handleNewItemNameChange}
      />
      <button onClick={addNewItem}>Add New Item</button>
    </div>
  );
};

export default LongForm;
