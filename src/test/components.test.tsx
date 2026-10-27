import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MenuCard } from "@/components/MenuCard";
import { CategoryNav } from "@/components/CategoryNav";
import { CartProvider, useCart } from "@/context/CartContext";
import { MenuItem, Category } from "@/types";

const mockItem: MenuItem = {
  id: "tacos-test",
  name: "Tacos Test DZ",
  nameAr: "تاكوس تجريبي",
  description: "Délicieux tacos au poulet mariné",
  price: 650,
  categoryId: "tacos",
  categoryName: "Tacos Algériens",
  image: "https://example.com/tacos.jpg",
  prepTimeMinutes: 12,
  inStock: true,
  isPopular: true,
  sizes: [{ id: "m", name: "Taille M", priceModifier: 0 }],
};

const mockCategories: Category[] = [
  { id: "all", name: "Tout le Menu", nameAr: "كل", icon: "Utensils", description: "" },
  { id: "tacos", name: "Tacos Algériens", nameAr: "تاكوس", icon: "Flame", description: "" },
];

describe("UI Components", () => {
  it("renders MenuCard with title, price, badges and handles clicks", () => {
    const handleSelect = vi.fn();
    render(<MenuCard item={mockItem} onSelect={handleSelect} />);

    expect(screen.getByText("Tacos Test DZ")).toBeInTheDocument();
    expect(screen.getByText("650")).toBeInTheDocument();
    expect(screen.getByText("DA")).toBeInTheDocument();
    expect(screen.getByText("Populaire")).toBeInTheDocument();
    expect(screen.getByText("12 min")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Tacos Test DZ"));
    expect(handleSelect).toHaveBeenCalledWith(mockItem);
  });

  it("renders CategoryNav and triggers selection callback", () => {
    const handleSelectCategory = vi.fn();
    render(
      <CategoryNav
        categories={mockCategories}
        activeCategoryId="all"
        onSelectCategory={handleSelectCategory}
      />
    );

    expect(screen.getByText("Tout le Menu")).toBeInTheDocument();
    const tacosButton = screen.getByText("Tacos Algériens");
    expect(tacosButton).toBeInTheDocument();

    fireEvent.click(tacosButton);
    expect(handleSelectCategory).toHaveBeenCalledWith("tacos");
  });

  it("CartContext manages item adding, quantity changes and calculations correctly", () => {
    function TestConsumer() {
      const { cart, cartCount, cartTotal, addToCart, updateQuantity, clearCart } = useCart();
      return (
        <div>
          <div data-testid="count">{cartCount}</div>
          <div data-testid="total">{cartTotal}</div>
          <button
            onClick={() =>
              addToCart({
                cartItemId: "c-1",
                menuItemId: "tacos-test",
                name: "Tacos Test DZ",
                image: "",
                basePrice: 650,
                selectedSauces: [],
                selectedExtras: [],
                quantity: 1,
                unitPrice: 650,
                totalPrice: 650,
              })
            }
          >
            Ajouter
          </button>
          <button onClick={() => updateQuantity("c-1", 1)}>Augmenter</button>
          <button onClick={() => clearCart()}>Vider</button>
        </div>
      );
    }

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    );

    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");

    // Add item
    fireEvent.click(screen.getByText("Ajouter"));
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByTestId("total")).toHaveTextContent("650");

    // Increase quantity
    fireEvent.click(screen.getByText("Augmenter"));
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("total")).toHaveTextContent("1300");

    // Clear cart
    fireEvent.click(screen.getByText("Vider"));
    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(screen.getByTestId("total")).toHaveTextContent("0");
  });
});
