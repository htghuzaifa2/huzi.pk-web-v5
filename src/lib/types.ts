

export interface ImageObject {
  url: string;
  alt: string;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  description: string;
  longDescription?: string;
  specifications?: Record<string, any>;
  category: string[];
  image: ImageObject;
  additionalImages: ImageObject[];
  stock?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}
