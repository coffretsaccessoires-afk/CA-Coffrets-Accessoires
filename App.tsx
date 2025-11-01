

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// --- TYPE DEFINITIONS ---
interface Product {
  id: string;
  name: string;
  category: 'Bijoux' | 'Coffrets' | 'Accessoires' | 'Personnalisés';
  price: number;
  salePrice?: number;
  description: string;
  details: {
    material: string;
    dimensions: string;
    care: string;
  };
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface CustomerInfo {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    zip?: string;
}

interface Order {
    id: string;
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
    date: Date;
}

interface HomepageSection {
  id: string;
  htmlContent: string;
}

interface CustomPageData {
  id: string;
  slug: string;
  title: string;
  content: string; // Will hold HTML content
}

interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook';
  imageUrl: string;
  caption: string;
  link: string;
  date: string;
}

interface SiteContent {
    // Homepage
    heroSlogan: string;
    heroSubtitle: string;
    heroButtonText: string;
    heroMediaType: 'image' | 'video';
    heroImageUrl: string;
    heroVideoUrl: string;

    newArrivalsTitle: string;
    bestSellersTitle: string;
    specialOffersTitle: string;
    
    universeTitle: string;
    universeText: string;
    universeButtonText: string;
    universeImageUrl: string;
    
    socialSectionTitle: string;
    customerReviewTitle: string;
    
    homepageSections: HomepageSection[];

    // Shop page
    shopTitle: string;
}

interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: Date;
}

interface SiteSettings {
    socialLinks: {
        instagram: string;
        facebook: string;
        tiktok: string;
    };
    popup: {
        enabled: boolean;
        title: string;
        text: string;
        buttonText: string;
        buttonLink: string;
    };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}


type Page = {
  name: string; // e.g., 'home', 'shop', 'product', 'custom-page', 'admin-products'
  productId?: string;
  slug?: string;
};

// --- HELPERS ---
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


// --- INITIAL DATA (Simulates a database) ---
const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod1', name: 'Collier Élégance Dorée', category: 'Bijoux', price: 69.90, description: 'Un collier délicat plaqué or 18k, parfait pour toutes les occasions.', details: { material: 'Plaqué or 18k, Zirconium', dimensions: 'Chaîne 45cm + 5cm extension', care: 'Éviter le contact avec l\'eau et le parfum.' }, imageUrl: 'https://images.unsplash.com/photo-1611652033959-8a356399335d?w=500&q=80', images: ['https://images.unsplash.com/photo-1611652033959-8a356399335d?w=800&q=80', 'https://images.unsplash.com/photo-1599643477877-539eb8a52e30?w=800&q=80', 'https://images.unsplash.com/photo-1611652033838-dbf52153562a?w=800&q=80'], rating: 4.8, reviewCount: 112, isNew: true, isBestSeller: true, isOnSale: false },
  { id: 'prod2', name: 'Coffret Cadeau "Sérénité"', category: 'Coffrets', price: 129.00, description: 'Le coffret parfait pour un moment de détente et de bien-être.', details: { material: 'Contient une bougie, un bracelet et un masque en soie.', dimensions: 'Boîte 25x25x10cm', care: 'Conserver dans un endroit frais et sec.' }, imageUrl: 'https://images.unsplash.com/photo-1572196289094-7c34015b6b8b?w=500&q=80', images: ['https://images.unsplash.com/photo-1572196289094-7c34015b6b8b?w=800&q=80'], rating: 5.0, reviewCount: 98, isNew: false, isBestSeller: true, isOnSale: true, salePrice: 99.00 },
  { id: 'prod3', name: 'Foulard en Soie "Rose Poudré"', category: 'Accessoires', price: 45.50, description: 'Un foulard en soie pure, doux et polyvalent pour sublimer vos tenues.', details: { material: '100% Soie de mûrier', dimensions: '90x90cm', care: 'Lavage à la main recommandé.' }, imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&q=80', images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80'], rating: 4.7, reviewCount: 76, isNew: true, isBestSeller: false, isOnSale: false },
  { id: 'prod4', name: 'Bracelet "Monogramme"', category: 'Personnalisés', price: 85.00, description: 'Faites graver vos initiales sur ce bracelet jonc élégant.', details: { material: 'Acier inoxydable plaqué or', dimensions: 'Ajustable', care: 'Nettoyer avec un chiffon doux.' }, imageUrl: 'https://images.unsplash.com/photo-1620921282914-2327d7f73967?w=500&q=80', images: ['https://images.unsplash.com/photo-1620921282914-2327d7f73967?w=800&q=80'], rating: 4.9, reviewCount: 150, isNew: false, isBestSeller: true, isOnSale: false },
  { id: 'prod5', name: 'Boucles d\'oreilles "Perle de Lune"', category: 'Bijoux', price: 55.00, description: 'Des créoles délicates ornées de perles d\'eau douce.', details: { material: 'Plaqué or 18k, perles d\'eau douce', dimensions: 'Diamètre 2cm', care: 'Éviter le contact avec les produits chimiques.' }, imageUrl: 'https://images.unsplash.com/photo-1615211603304-555e7b233a0e?w=500&q=80', images: ['https://images.unsplash.com/photo-1615211603304-555e7b233a0e?w=800&q=80'], rating: 4.8, reviewCount: 89, isNew: false, isBestSeller: false, isOnSale: true, salePrice: 44.90 },
  { id: 'prod6', name: 'Barrette Cheveux "Éclat Fleuri"', category: 'Accessoires', price: 29.90, description: 'Une barrette ornée de fleurs en nacre pour une coiffure romantique.', details: { material: 'Nacre, Laiton', dimensions: '8cm de longueur', care: 'Manipuler avec soin.' }, imageUrl: 'https://images.unsplash.com/photo-1589154289479-78b1965a3b2b?w=500&q=80', images: ['https://images.unsplash.com/photo-1589154289479-78b1965a3b2b?w=800&q=80'], rating: 4.6, reviewCount: 54, isNew: true, isBestSeller: false, isOnSale: false },
];

const INITIAL_SITE_CONTENT: SiteContent = {
    heroSlogan: "Sublimez vos moments",
    heroSubtitle: "Avec nos coffrets élégants et intemporels.",
    heroButtonText: "Découvrir nos coffrets",
    heroMediaType: 'video',
    heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-in-a-floral-dress-in-a-field-of-flowers-48208-large.mp4",
    heroImageUrl: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2079",
    newArrivalsTitle: "Nouveautés",
    bestSellersTitle: "Nos Meilleures Ventes",
    specialOffersTitle: "Offres Spéciales",
    universeTitle: "Notre Univers",
    universeText: "\"Chaque coffret raconte une histoire.\"",
    universeButtonText: "Découvrir notre histoire",
    universeImageUrl: "https://images.unsplash.com/photo-1581798319933-11a3733a4122?q=80&w=2070",
    socialSectionTitle: "Actualités",
    customerReviewTitle: "Ce que nos clients disent",
    shopTitle: "Notre Boutique",
    homepageSections: [
      { id: 'section1', htmlContent: '<div class="text-center p-8 bg-rose-50 rounded-lg"><h3 class="text-2xl font-serif">Livraison Offerte</h3><p class="text-secondary">Pour toute commande supérieure à 100 TND.</p></div>'}
    ]
};

const INITIAL_CUSTOM_PAGES: CustomPageData[] = [
    { id: 'page_about', slug: 'about', title: 'À Propos', content: '<h2>Notre Histoire</h2><p>Inspiré par l\'élégance intemporelle et la beauté des moments précieux, CA Coffrets Accessoires a pour mission de vous proposer des créations qui racontent une histoire. Fondée en 2023, notre marque est née d\'une passion pour l\'artisanat et le désir d\'offrir des pièces uniques qui célèbrent la féminité.</p><p>Chaque article est choisi avec le plus grand soin pour sa qualité, son authenticité et sa capacité à transformer le quotidien en une occasion spéciale. Nos valeurs sont l\'élégance, l\'authenticité, et la durabilité.</p>' },
    { id: 'page_contact', slug: 'contact', title: 'Contact', content: '<h2>Nos Coordonnées</h2><p><strong>Email:</strong> coffretsaccessoires@gmail.com</p><p><strong>Téléphone:</strong> 54 235 633</p><p><strong>Adresse:</strong> manzel chaker Sfax Tunisia</p><h2>Envoyer un message</h2><p>Utilisez le formulaire ci-dessous pour nous contacter.</p>' },
    { id: 'page1', slug: 'politique-de-livraison', title: 'Politique de Livraison', content: '<h2>Livraison Standard</h2><p>Nos délais de livraison sont de 3 à 5 jours ouvrés pour la Tunisie. Les frais de livraison sont de 8 TND.</p><h2>Livraison Express</h2><p>Recevez votre commande en 24h à 48h pour 15 TND.</p>' },
    { id: 'page2', slug: 'retours-echanges', title: 'Retours et Échanges', content: '<h2>30 jours pour changer d\'avis</h2><p>Vous pouvez nous retourner les articles sous 30 jours à condition qu\'ils soient dans leur état d\'origine. Les frais de retour sont à votre charge.</p>' },
];

const INITIAL_SOCIAL_POSTS: SocialPost[] = [
    { id: 'social1', platform: 'instagram', imageUrl: 'https://images.unsplash.com/photo-1598595958729-8772b22b5e4a?w=500&q=80', caption: 'Nouveautés en boutique ! ✨ #bijoux #nouveau', link: '#', date: 'Il y a 2 jours' },
    { id: 'social2', platform: 'facebook', imageUrl: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=500&q=80', caption: 'Notre coffret "Sérénité" est parfait pour un moment de détente.', link: '#', date: 'Il y a 5 jours' },
    { id: 'social3', platform: 'instagram', imageUrl: 'https://images.unsplash.com/photo-1557180295-76eee20542e8?w=500&q=80', caption: 'Inspiration du jour... 💍', link: '#', date: 'Il y a 1 semaine' },
    { id: 'social4', platform: 'instagram', imageUrl: 'https://images.unsplash.com/photo-1506795499318-5d15b0dba2a0?w=500&q=80', caption: 'Le cadeau parfait vous attend.', link: '#', date: 'Il y a 1 semaine' },
    { id: 'social5', platform: 'facebook', imageUrl: 'https://images.unsplash.com/photo-1611312526786-80d381b0a827?w=500&q=80', caption: 'Découvrez nos accessoires cheveux pour sublimer vos coiffures.', link: '#', date: 'Il y a 2 semaines'},
];

const INITIAL_REVIEWS: Review[] = [
    { id: 'rev1', productId: 'prod1', author: 'Sophie L.', rating: 5, comment: 'Absolument magnifique ! La qualité est au rendez-vous, je suis ravie de mon achat.', date: new Date('2023-10-15T10:00:00Z') },
    { id: 'rev2', productId: 'prod2', author: 'Camille D.', rating: 5, comment: 'Le coffret est sublime, c\'était le cadeau parfait. Présentation très soignée.', date: new Date('2023-10-20T14:30:00Z') },
    { id: 'rev3', productId: 'prod4', author: 'Manon B.', rating: 4, comment: 'Très joli bracelet, la gravure est fine et bien réalisée. Un peu plus petit que ce que j\'imaginais.', date: new Date('2023-10-18T09:00:00Z') },
    { id: 'rev4', productId: 'prod1', author: 'Julie M.', rating: 5, comment: 'Simple, élégant, je ne le quitte plus !', date: new Date('2023-11-01T12:00:00Z') },
];

const INITIAL_SITE_SETTINGS: SiteSettings = {
    socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        tiktok: "https://tiktok.com",
    },
    popup: {
        enabled: true,
        title: "-10% sur votre première commande !",
        text: "Inscrivez-vous à notre newsletter et recevez une réduction exclusive.",
        buttonText: "S'inscrire",
        buttonLink: "signup", // Directs to the signup page now
    }
};

// --- ICONS ---
const Icon: React.FC<React.SVGProps<SVGSVGElement> & { path: string }> = ({ path, ...props }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon path="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" {...props} />;
const ShoppingBagIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 00-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => <Icon className={className} path="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />;
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => <Icon className={className} path="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />;
const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" /></svg>;
const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.32 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 12 2.04Z" /></svg>;
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.98-1.55-1.99-2.3-4.51-2.09-7.18.2-2.61 1.14-5.11 2.79-7.01 1.64-1.9 3.9-3.06 6.26-3.11 1.03-.01 2.07-.01 3.1-.02V.02z"/></svg>;


// --- HELPER COMPONENTS ---
const SanitizeHTML: React.FC<{ html: string; className?: string }> = ({ html, className }) => (
    <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
);

// --- UI COMPONENTS ---
const Header: React.FC<{
    navigate: (page: string, slug?: string) => void;
    cartItemCount: number,
    customPages: CustomPageData[],
    currentUser: User | null;
    handleUserLogout: () => void;
}> = ({ navigate, cartItemCount, customPages, currentUser, handleUserLogout }) => {
    const mainLinks = [
        { page: 'home', label: 'Accueil' },
        { page: 'shop', label: 'Boutique' },
        { page: 'about', label: 'À Propos' },
        { page: 'contact', label: 'Contact' }
    ];

    return (
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-4xl font-serif font-bold text-secondary cursor-pointer" onClick={() => navigate('home')}>CA</div>
                <ul className="hidden md:flex items-center space-x-8 font-medium text-primary">
                     {mainLinks.map(({ page, label }) => {
                        const isSpecialPage = ['home', 'shop'].includes(page);
                        const navFunc = (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (isSpecialPage) {
                                navigate(page);
                            } else {
                                navigate('custom-page', page);
                            }
                        };
                        return (
                             <li key={page}>
                                <a href="#" onClick={navFunc} className="capitalize relative after:absolute after:bg-accent after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:scale-x-0 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left hover:text-accent">
                                    {label}
                                </a>
                            </li>
                        );
                    })}
                     {customPages.filter(p => !['about', 'contact'].includes(p.slug)).map(p => (
                        <li key={p.id}><a href="#" onClick={(e) => { e.preventDefault(); navigate('custom-page', p.slug); }} className="hover:text-accent transition-colors duration-300">{p.title}</a></li>
                    ))}
                </ul>
                <div className="flex items-center space-x-6">
                    {currentUser ? (
                        <>
                            <span className="font-medium">Bonjour, {currentUser.firstName}</span>
                            <a href="#" onClick={(e) => { e.preventDefault(); handleUserLogout(); }} className="hover:text-accent text-sm">Déconnexion</a>
                        </>
                    ) : (
                         <div className="hidden md:flex items-center space-x-4">
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('login'); }} className="hover:text-accent font-medium transition-colors">Connexion</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('signup'); }} className="bg-accent text-white font-bold py-2 px-4 rounded-full text-sm hover:bg-accent-hover transition-colors">S'inscrire</a>
                        </div>
                    )}
                    <div className="relative cursor-pointer" onClick={() => navigate('cart')}>
                        <ShoppingBagIcon className="w-7 h-7 text-secondary hover:text-accent transition-colors" />
                        {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                    </div>
                </div>
            </nav>
        </header>
    );
};


const Footer: React.FC<{ navigate: (page: string, slug?: string) => void; customPages: CustomPageData[], siteSettings: SiteSettings; }> = ({ navigate, customPages, siteSettings }) => (
    <footer className="bg-surface text-secondary border-t border-rose-100">
        <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-3xl font-serif font-bold text-secondary mb-4">CA</h3>
                    <p className="text-sm">Sublimez vos moments avec nos coffrets élégants et intemporels.</p>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-primary">Navigation</h4>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('home')}}>Accueil</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('shop')}}>Boutique</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('custom-page', 'about')}}>À propos</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('custom-page', 'contact')}}>Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-primary">Informations</h4>
                    <ul className="space-y-2 text-sm">
                        {customPages.map(p => (
                            <li key={p.id}><a href="#" onClick={(e) => { e.preventDefault(); navigate('custom-page', p.slug); }}>{p.title}</a></li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h4 className="font-bold mb-4 text-primary">Suivez-nous</h4>
                     <div className="flex space-x-4">
                        <a href={siteSettings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors"><InstagramIcon className="w-6 h-6" /></a>
                        <a href={siteSettings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors"><FacebookIcon className="w-6 h-6" /></a>
                        <a href={siteSettings.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent transition-colors"><TikTokIcon className="w-6 h-6" /></a>
                    </div>
                    <div className="mt-8">
                        <h4 className="font-bold mb-4 text-primary">Administration</h4>
                        <ul className="space-y-2 text-sm">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('admin-login')}}>Accès Admin</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="text-center text-sm mt-12 border-t border-rose-100 pt-6">© {new Date().getFullYear()} CA Coffrets Accessoires. Tous droits réservés.</div>
        </div>
    </footer>
);

type ProductCardProps = { product: Product; navigate: (page: string, productId?: string) => void; addToCart: (product: Product) => void; };
const ProductCard: React.FC<ProductCardProps> = ({ product, navigate, addToCart }) => (
    <div className="group relative bg-surface rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-xl flex flex-col h-full">
        <div className="relative cursor-pointer" onClick={() => navigate('product', product.id)}>
            <img src={product.imageUrl} alt={product.name} className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isNew && <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded">Nouveau</span>}
                {product.isOnSale && <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Solde</span>}
            </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-semibold text-primary truncate">{product.name}</h3>
            <p className="text-sm text-secondary">{product.category}</p>
            <div className="flex items-center my-2">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                <span className="text-xs text-secondary ml-2">({product.reviewCount})</span>
            </div>
            <div className="text-xl font-bold text-primary mt-auto pt-2">
                 {product.isOnSale && product.salePrice ? (
                    <>
                        <span className="text-red-600 mr-2">{product.salePrice.toFixed(2)} TND</span>
                        <span className="line-through text-secondary text-base">{product.price.toFixed(2)} TND</span>
                    </>
                 ) : (
                    <span>{product.price.toFixed(2)} TND</span>
                 )}
            </div>
        </div>
        <button onClick={() => addToCart(product)} className="w-full bg-rose-50 text-secondary font-bold py-3 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-white">Ajouter au panier</button>
    </div>
);

const Carousel: React.FC<{ children: React.ReactNode; autoplay?: boolean }> = ({ children, autoplay = true }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const items = React.Children.toArray(children);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, items.length);
    }, [items.length]);

    const scrollTo = useCallback((index: number) => {
        if (scrollContainerRef.current && itemRefs.current[index]) {
            const container = scrollContainerRef.current;
            const targetItem = itemRefs.current[index];
            if (targetItem) {
                const scrollLeft = targetItem.offsetLeft - container.offsetLeft;
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, []);

    const stopInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startInterval = useCallback(() => {
        stopInterval();
        if (autoplay && items.length > 1) {
            intervalRef.current = window.setInterval(() => {
                setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
            }, 5000);
        }
    }, [autoplay, items.length, stopInterval]);

    useEffect(() => {
        scrollTo(currentIndex);
    }, [currentIndex, scrollTo]);

    useEffect(() => {
        startInterval();
        return stopInterval;
    }, [startInterval, stopInterval]);

    const handleUserInteraction = (action: () => void) => {
        action();
        startInterval();
    };

    const next = () => setCurrentIndex(prev => (prev + 1) % items.length);
    const prev = () => setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    const goToIndex = (index: number) => setCurrentIndex(index);

    return (
        <div className="relative group/carousel" onMouseEnter={stopInterval} onMouseLeave={startInterval}>
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide space-x-8 py-4"
            >
                {items.map((child, index) => (
                    <div
                        key={index}
                        ref={el => { itemRefs.current[index] = el; }}
                        className="snap-center min-w-[280px] md:min-w-[320px] flex-shrink-0"
                    >
                        {child}
                    </div>
                ))}
            </div>

            <button onClick={() => handleUserInteraction(prev)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md hover:bg-white transition-all z-10 opacity-0 group-hover/carousel:opacity-100 hidden md:block"><ArrowLeftIcon className="w-6 h-6 text-primary" /></button>
            <button onClick={() => handleUserInteraction(next)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow-md hover:bg-white transition-all z-10 opacity-0 group-hover/carousel:opacity-100 hidden md:block"><ArrowRightIcon className="w-6 h-6 text-primary" /></button>
            
            {items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 pb-2">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleUserInteraction(() => goToIndex(index))}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-accent scale-125' : 'bg-stone-300 hover:bg-stone-400'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const SocialPostCard: React.FC<{ post: SocialPost }> = ({ post }) => (
    <a href={post.link} target="_blank" rel="noopener noreferrer" className="group bg-surface rounded-lg overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-xl block">
        <div className="relative">
            <img src={post.imageUrl} alt={post.caption} className="w-full h-64 object-cover" />
            <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full">
                {post.platform === 'instagram' ? <InstagramIcon className="w-6 h-6 text-[#E1306C]" /> : <FacebookIcon className="w-6 h-6 text-[#1877F2]" />}
            </div>
        </div>
        <div className="p-4">
            <p className="text-sm text-secondary truncate">{post.caption}</p>
            <p className="text-xs text-stone-400 mt-1">{post.date}</p>
        </div>
    </a>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="bg-surface p-6 rounded-lg shadow-sm h-full flex flex-col justify-between">
        <div>
            <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
            </div>
            <p className="text-secondary italic">"{review.comment}"</p>
        </div>
        <p className="text-right font-bold text-primary mt-4">- {review.author}</p>
    </div>
);

const MarketingPopup: React.FC<{ settings: SiteSettings['popup']; navigate: (page: string) => void }> = ({ settings, navigate }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('popupSeen');
        if (!hasSeenPopup && settings.enabled) {
            const timer = setTimeout(() => setIsOpen(true), 3000); // Open after 3s
            return () => clearTimeout(timer);
        }
    }, [settings.enabled]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('popupSeen', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-5 right-5 w-80 bg-surface shadow-2xl rounded-lg p-6 z-50 animate-fade-in-up">
            <button onClick={handleClose} className="absolute top-2 right-2 text-2xl text-secondary hover:text-primary">&times;</button>
            <h3 className="font-bold text-lg text-primary mb-2">{settings.title}</h3>
            <p className="text-sm text-secondary mb-4">{settings.text}</p>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate(settings.buttonLink); handleClose(); }} className="w-full text-center block bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover transition-colors">{settings.buttonText}</a>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const HomePage: React.FC<{ navigate: (page: string, id?: string) => void; products: Product[]; content: SiteContent; addToCart: (product: Product) => void; socialPosts: SocialPost[]; reviews: Review[] }> = ({ navigate, products, content, addToCart, socialPosts, reviews }) => (
    <div className="space-y-24 pb-24">
        <section className="relative h-[90vh] flex items-center justify-center text-white text-center overflow-hidden">
            {content.heroMediaType === 'video' && content.heroVideoUrl ? (
                 <video autoPlay loop muted playsInline className="absolute z-0 w-auto min-w-full min-h-full max-w-none">
                    <source src={content.heroVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <img src={content.heroImageUrl} alt="Bannière" className="absolute z-0 w-full h-full object-cover" />
            )}
           
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative z-10 px-6">
                <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 animate-fade-in">{content.heroSlogan}</h1>
                <p className="text-lg md:text-2xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>{content.heroSubtitle}</p>
                <div className="space-x-4 animate-fade-in-up" style={{ animationDelay: '1s' }}>
                    <button onClick={() => navigate('shop')} className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-rose-100 transition-all duration-300">{content.heroButtonText}</button>
                </div>
            </div>
        </section>

        <section className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center mb-12">{content.newArrivalsTitle}</h2>
            <Carousel>
                {products.filter(p => p.isNew).slice(0, 8).map(product => (
                    <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
                ))}
            </Carousel>
        </section>
        
        <section className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center mb-12">{content.bestSellersTitle}</h2>
             <Carousel>
                {products.filter(p => p.isBestSeller).slice(0, 8).map(product => (
                     <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
                ))}
            </Carousel>
        </section>

        <section className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center mb-12">{content.specialOffersTitle}</h2>
            <Carousel>
                {products.filter(p => p.isOnSale).slice(0, 8).map(product => (
                     <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />
                ))}
            </Carousel>
        </section>

        {content.homepageSections.map(section => (
            <section key={section.id} className="container mx-auto px-6">
                <SanitizeHTML html={section.htmlContent} />
            </section>
        ))}

        <section className="relative py-20 bg-cover bg-center text-white" style={{ backgroundImage: `url('${content.universeImageUrl}')`}}>
            <div className="absolute inset-0 bg-primary/70"></div>
            <div className="relative container mx-auto px-6 text-center max-w-3xl">
                <h2 className="text-4xl font-serif mb-4">{content.universeTitle}</h2>
                <p className="mb-6 leading-relaxed">{content.universeText}</p>
                <button 
                    onClick={() => navigate('custom-page', 'about')} 
                    className="font-bold border-b-2 border-white hover:bg-white hover:text-primary transition-all duration-300 px-4 py-2"
                >
                    {content.universeButtonText}
                </button>
            </div>
        </section>
        
        <section className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center mb-12">{content.customerReviewTitle}</h2>
            <Carousel autoplay={true}>
                {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </Carousel>
        </section>

        <section className="container mx-auto px-6">
            <h2 className="text-4xl font-serif text-center mb-12">{content.socialSectionTitle}</h2>
            <Carousel autoplay={false}>
                {socialPosts.map(post => (
                    <SocialPostCard key={post.id} post={post} />
                ))}
            </Carousel>
        </section>
    </div>
);

const ShopPage: React.FC<{ title: string; navigate: (page: string, productId?: string) => void; products: Product[]; addToCart: (product: Product) => void; }> = ({ title, navigate, products, addToCart }) => {
    const [filter, setFilter] = useState('Tous');
    const [sort, setSort] = useState('default');

    const filteredAndSortedProducts = useMemo(() => {
        let items = [...products];
        if (filter !== 'Tous') {
            items = items.filter(p => p.category === filter);
        }
        if (sort === 'price-asc') {
            items.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        } else if (sort === 'price-desc') {
            items.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        } else if (sort === 'name-asc') {
            items.sort((a, b) => a.name.localeCompare(b.name));
        }
        return items;
    }, [products, filter, sort]);
    
    const categories = ['Tous', 'Bijoux', 'Coffrets', 'Accessoires', 'Personnalisés'];

    return (
        <div className="py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-5xl font-serif text-center mb-12">{title}</h1>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                           <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === cat ? 'bg-accent text-white' : 'bg-surface hover:bg-rose-100'}`}>{cat}</button>
                        ))}
                    </div>
                    <select value={sort} onChange={(e) => setSort(e.target.value)} className="p-2 border rounded-md bg-surface border-rose-200">
                        <option value="default">Trier par défaut</option>
                        <option value="price-asc">Prix: Croissant</option>
                        <option value="price-desc">Prix: Décroissant</option>
                        <option value="name-asc">Nom: A-Z</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredAndSortedProducts.map(product => <ProductCard key={product.id} product={product} navigate={navigate} addToCart={addToCart} />)}
                </div>
            </div>
        </div>
    );
};

const ReviewForm: React.FC<{ productId: string; addReview: (productId: string, author: string, rating: number, comment: string) => void; }> = ({ productId, addReview }) => {
    const [author, setAuthor] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && author && comment) {
            addReview(productId, author, rating, comment);
            setAuthor('');
            setRating(0);
            setComment('');
            setSubmitted(true);
        }
    };

    if (submitted) {
        return <p className="text-green-600 font-semibold p-4 bg-green-50 rounded-md">Merci ! Votre avis a été soumis.</p>;
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Votre nom" className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" required />
            <div className="flex items-center">
                <span className="mr-3 font-medium">Votre note :</span>
                {[...Array(5)].map((_, i) => (
                    <StarIcon
                        key={i}
                        className={`w-6 h-6 cursor-pointer ${ (hoverRating || rating) > i ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Votre avis" rows={4} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" required />
            <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover">Envoyer l'avis</button>
        </form>
    );
};


const ProductPage: React.FC<{ product: Product; addToCart: (product: Product) => void; reviews: Review[]; addReview: (productId: string, author: string, rating: number, comment: string) => void; }> = ({ product, addToCart, reviews, addReview }) => {
    const [mainImage, setMainImage] = useState(product.imageUrl);
    const productReviews = useMemo(() => reviews.filter(r => r.productId === product.id), [reviews, product.id]);

    useEffect(() => {
        setMainImage(product.imageUrl);
    }, [product]);

    if (!product) {
        return <div className="text-center py-24">Produit non trouvé.</div>;
    }

    return (
        <div className="py-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div>
                        <img src={mainImage} alt={product.name} className="w-full rounded-lg shadow-lg mb-4" />
                        <div className="flex gap-2">
                            {[product.imageUrl, ...product.images].filter((v, i, a) => a.indexOf(v) === i).map((img, idx) => (
                                <img key={idx} src={img} onClick={() => setMainImage(img)} className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-accent' : 'border-transparent'}`} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-serif font-bold mb-2">{product.name}</h1>
                        <p className="text-lg text-secondary mb-4">{product.category}</p>
                         <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                            <a href="#reviews" className="text-sm text-secondary ml-2 hover:underline">({productReviews.length} avis)</a>
                        </div>
                        <div className="text-3xl font-bold text-primary mb-6">
                            {product.isOnSale && product.salePrice ? (
                                <>
                                    <span className="text-red-600 mr-3">{product.salePrice.toFixed(2)} TND</span>
                                    <span className="line-through text-secondary text-xl">{product.price.toFixed(2)} TND</span>
                                </>
                            ) : (
                                <span>{product.price.toFixed(2)} TND</span>
                            )}
                        </div>
                        <p className="text-secondary leading-relaxed mb-6">{product.description}</p>
                        <button onClick={() => addToCart(product)} className="w-full bg-accent text-white font-bold py-4 rounded-full hover:bg-accent-hover transition-all duration-300">Ajouter au panier</button>
                        <div className="mt-8 border-t border-rose-100 pt-6">
                            <h3 className="font-bold text-lg mb-2">Détails</h3>
                            <ul className="list-disc list-inside text-secondary space-y-1">
                                <li><strong>Matériaux :</strong> {product.details.material}</li>
                                <li><strong>Dimensions :</strong> {product.details.dimensions}</li>
                                <li><strong>Entretien :</strong> {product.details.care}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                 <div id="reviews" className="mt-16 border-t border-rose-100 pt-12">
                    <h2 className="text-3xl font-serif mb-8">Avis des clients ({productReviews.length})</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
                            {productReviews.length > 0 ? productReviews.map(review => (
                                <div key={review.id} className="border-b border-rose-100 pb-4">
                                    <div className="flex items-center mb-1">
                                        {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />)}
                                        <span className="font-bold ml-3 text-primary">{review.author}</span>
                                    </div>
                                    <p className="text-secondary text-sm">{review.comment}</p>
                                </div>
                            )) : <p className="text-secondary">Aucun avis pour ce produit pour le moment. Soyez le premier à en laisser un !</p>}
                        </div>
                         <div>
                            <h3 className="text-xl font-bold mb-4">Laissez votre avis</h3>
                            <ReviewForm productId={product.id} addReview={addReview} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomPageRenderer: React.FC<{ page: CustomPageData | undefined }> = ({ page }) => {
    if (!page) {
        return (
             <div className="bg-surface py-20">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h1 className="text-5xl font-serif text-center mb-4">404 - Page non trouvée</h1>
                    <p className="text-secondary">Désolé, la page que vous cherchez n'existe pas.</p>
                </div>
            </div>
        );
    }
    
    if (page.slug === 'contact') {
        return (
            <div className="bg-surface py-20">
                <div className="container mx-auto px-6 max-w-4xl">
                    <h1 className="text-5xl font-serif text-center mb-12">{page.title}</h1>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="prose lg:prose-xl text-secondary leading-loose">
                             <SanitizeHTML html={page.content} />
                        </div>
                        <div>
                             <form className="space-y-4">
                                <input type="text" placeholder="Nom" className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                <input type="email" placeholder="Email" className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                                <textarea placeholder="Votre message" rows={5} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"></textarea>
                                <button type="submit" className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-accent-hover">Envoyer</button>
                             </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-surface py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-5xl font-serif text-center mb-12">{page.title}</h1>
                <div className="prose lg:prose-xl mx-auto text-secondary leading-loose">
                     <SanitizeHTML html={page.content} />
                </div>
            </div>
        </div>
    );
};

const CartPage: React.FC<{ cart: CartItem[]; updateCartQuantity: (id: string, q: number) => void; removeFromCart: (id: string) => void; navigate: (page: string) => void; }> = ({ cart, updateCartQuantity, removeFromCart, navigate }) => {
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.salePrice ?? item.price) * item.quantity, 0), [cart]);

    if (cart.length === 0) {
        return (
            <div className="text-center py-24 min-h-[60vh]">
                <h1 className="text-3xl font-serif mb-4">Votre panier est vide</h1>
                <button onClick={() => navigate('shop')} className="bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-hover transition-all duration-300">Continuer mes achats</button>
            </div>
        );
    }

    return (
        <div className="py-12 min-h-[60vh]">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-serif font-bold text-center mb-8">Mon Panier</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-surface rounded-lg shadow-sm p-6 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center space-x-4 border-b border-rose-100 pb-4 last:border-b-0">
                                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-secondary">{(item.salePrice ?? item.price).toFixed(2)} TND</p>
                                </div>
                                <div className="flex items-center border border-rose-200 rounded-full text-sm">
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-3 py-1">-</button>
                                    <span className="px-3">{item.quantity}</span>
                                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-3 py-1">+</button>
                                </div>
                                <p className="font-bold w-20 text-right">{((item.salePrice ?? item.price) * item.quantity).toFixed(2)} TND</p>
                                <button onClick={() => removeFromCart(item.id)} className="text-stone-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="bg-surface rounded-lg shadow-sm p-6 sticky top-24">
                        <h2 className="text-xl font-bold border-b border-rose-100 pb-3 mb-4">Résumé</h2>
                        <div className="flex justify-between font-bold text-lg border-t border-rose-100 pt-3 mb-6"><span>Total</span><span>{subtotal.toFixed(2)} TND</span></div>
                        <button onClick={() => navigate('checkout')} className="w-full bg-accent text-white font-bold py-3 rounded-full hover:bg-accent-hover">Passer à la caisse</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckoutPage: React.FC<{ handleAddOrder: (customer: CustomerInfo) => void; cart: CartItem[] }> = ({ handleAddOrder, cart }) => {
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', zip: '' });
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.salePrice ?? item.price) * item.quantity, 0), [cart]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddOrder(customerInfo);
    };

    if (cart.length === 0) {
        return <div className="text-center py-24">Votre panier est vide. Impossible de passer commande.</div>;
    }

    return (
        <div className="py-12">
            <div className="container mx-auto px-6 max-w-2xl">
                <h1 className="text-4xl font-serif font-bold text-center mb-8">Paiement</h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-bold">Vos informations</h2>
                         <div className="grid grid-cols-2 gap-4">
                             <input required type="text" placeholder="Prénom" value={customerInfo.firstName} onChange={e => setCustomerInfo({...customerInfo, firstName: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                             <input required type="text" placeholder="Nom" value={customerInfo.lastName} onChange={e => setCustomerInfo({...customerInfo, lastName: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                         </div>
                        <input required type="tel" placeholder="Téléphone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                        <input required type="email" placeholder="Email" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                        <input required type="text" placeholder="Adresse" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                        <input required type="text" placeholder="Ville" value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                        <input type="text" placeholder="Code Postal (Optionnel)" value={customerInfo.zip} onChange={e => setCustomerInfo({...customerInfo, zip: e.target.value})} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500"/>
                         <button type="submit" className="w-full bg-accent text-white font-bold py-3 rounded-full hover:bg-accent-hover">Valider la commande</button>
                    </form>
                    <div className="bg-surface p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Votre commande</h2>
                        {cart.map(item => (
                             <div key={item.id} className="flex justify-between text-sm mb-2">
                                <span>{item.name} x {item.quantity}</span>
                                <span className="font-medium">{((item.salePrice ?? item.price) * item.quantity).toFixed(2)} TND</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold text-lg border-t border-rose-100 pt-3 mt-4"><span>Total</span><span>{subtotal.toFixed(2)} TND</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConfirmationPage: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => (
    <div className="text-center py-24 min-h-[60vh]">
        <h1 className="text-3xl font-serif mb-4">Merci pour votre commande !</h1>
        <p className="text-secondary mb-8">Vous recevrez bientôt un email de confirmation.</p>
        <button onClick={() => navigate('shop')} className="bg-accent text-white font-bold py-3 px-8 rounded-full hover:bg-accent-hover transition-all duration-300">Continuer mes achats</button>
    </div>
);

// --- AUTH PAGES ---
const SignupPage: React.FC<{ handleSignup: (firstName: string, lastName: string, email: string, pass: string) => boolean, navigate: (page: string) => void }> = ({ handleSignup, navigate }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!handleSignup(firstName, lastName, email, password)) {
            setError('Cet email est déjà utilisé. Veuillez en choisir un autre.');
        }
    };
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-rose-50 py-12">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-3xl font-serif font-bold mb-6 text-center text-primary">Créer un compte</h1>
                <div className="space-y-4">
                    <input type="text" placeholder="Prénom" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500" required/>
                    <input type="text" placeholder="Nom" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500" required/>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500" required/>
                    <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500" required/>
                </div>
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                <button type="submit" className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-md hover:bg-accent-hover">S'inscrire</button>
                <p className="text-center text-sm mt-4">Déjà un compte ? <a href="#" onClick={(e) => { e.preventDefault(); navigate('login'); }} className="text-accent hover:underline">Se connecter</a></p>
            </form>
        </div>
    );
};

const LoginPage: React.FC<{ handleLogin: (email: string, pass: string) => boolean, navigate: (page: string) => void }> = ({ handleLogin, navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        if (!handleLogin(email, password)) {
            setError(true);
        }
    };
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-rose-50 py-12">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-3xl font-serif font-bold mb-6 text-center text-primary">Connexion</h1>
                 <div className="space-y-4">
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500" required/>
                    <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-rose-200 rounded-md bg-white text-gray-900 placeholder-gray-500" required/>
                </div>
                {error && <p className="text-red-500 text-sm mt-4">Email ou mot de passe incorrect.</p>}
                <button type="submit" className="w-full mt-6 bg-accent text-white font-bold py-3 rounded-md hover:bg-accent-hover">Se connecter</button>
                 <p className="text-center text-sm mt-4">Pas encore de compte ? <a href="#" onClick={(e) => { e.preventDefault(); navigate('signup'); }} className="text-accent hover:underline">S'inscrire</a></p>
            </form>
        </div>
    );
};


// --- ADMIN COMPONENTS ---
const AdminLoginPage: React.FC<{ handleLogin: (pass: string) => boolean }> = ({ handleLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!handleLogin(password)) {
            setError(true);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-primary">Admin Login</h1>
                <input type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }} className="w-full p-3 border border-rose-200 rounded-md mb-4 bg-white text-gray-900 placeholder-gray-500"/>
                {error && <p className="text-red-500 text-sm mb-4">Mot de passe incorrect.</p>}
                <button type="submit" className="w-full bg-accent text-white font-bold py-3 rounded-md hover:bg-accent-hover">Connexion</button>
            </form>
        </div>
    );
};

const AdminLayout: React.FC<{ children: React.ReactNode; navigate: (page: string) => void; handleLogout: () => void; pageName: string }> = ({ children, navigate, handleLogout, pageName }) => (
    <div className="flex min-h-screen bg-rose-50 text-primary">
        <aside className="w-64 bg-secondary text-white p-6 flex flex-col">
            <h1 className="text-2xl font-serif font-bold mb-8 cursor-pointer text-white" onClick={() => navigate('admin-dashboard')}>Admin</h1>
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {[
                        ['admin-dashboard', 'Tableau de bord'],
                        ['admin-products', 'Produits'],
                        ['admin-orders', 'Commandes'],
                        ['admin-clients', 'Clients'],
                        ['admin-content', 'Gestionnaire de Contenu'],
                    ].map(([page, label]) => (
                         <li key={page}>
                            <a href="#" 
                               onClick={(e) => { e.preventDefault(); navigate(page); }} 
                               className={`block p-2 rounded transition-colors ${pageName === page ? 'bg-accent/80' : 'hover:bg-accent/50'}`}>
                               {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('home'); }} className="w-full text-left mt-auto mb-4 hover:text-accent">Voir le site</a>
            <button onClick={handleLogout} className="w-full text-left hover:text-accent">Déconnexion</button>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
            {children}
        </main>
    </div>
);

const AdminDashboard: React.FC<{ orders: Order[], products: Product[], users: User[] }> = ({ orders, products, users }) => {
    const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;

    const stats = [
        { label: 'Revenu Total', value: `${totalRevenue.toFixed(2)} TND` },
        { label: 'Commandes Totales', value: totalOrders },
        { label: 'Clients Enregistrés', value: totalUsers },
        { label: 'Produits Actifs', value: totalProducts },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-sm font-medium text-secondary">{stat.label}</h3>
                        <p className="text-3xl font-bold text-primary mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Dernières Commandes</h2>
                <div className="space-y-4">
                    {orders.length > 0 ? [...orders].reverse().slice(0, 5).map(o => (
                        <div key={o.id} className="border-b border-rose-100 pb-2 text-sm">
                            <p><strong>ID:</strong> {o.id}</p>
                            <p><strong>Client:</strong> {o.customer.firstName} {o.customer.lastName} ({o.customer.email})</p>
                            <p><strong>Total:</strong> {o.total.toFixed(2)} TND | <strong>Date:</strong> {o.date.toLocaleDateString('fr-FR')}</p>
                        </div>
                    )) : <p>Aucune commande pour le moment.</p>}
                </div>
            </div>
        </div>
    );
};

const AdminProducts: React.FC<{ products: Product[]; setProducts: React.Dispatch<React.SetStateAction<Product[]>> }> = ({ products, setProducts }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleSave = (productToSave: Product) => {
        if (editingProduct) { // Update
            setProducts(prev => prev.map(p => p.id === productToSave.id ? productToSave : p));
        } else { // Create
            setProducts(prev => [...prev, { ...productToSave, id: `prod_${Date.now()}` }]);
        }
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };
    
    const openFormForEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const openFormForAdd = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };
    
    if (isFormOpen) {
        return <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gérer les Produits</h1>
                <button onClick={openFormForAdd} className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover">Ajouter un produit</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                {products.map(p => (
                    <div key={p.id} className="flex items-center border-b border-rose-100 py-2 text-sm">
                        <img src={p.imageUrl} className="w-12 h-12 object-cover rounded mr-4" />
                        <span className="flex-1 font-semibold">{p.name}</span>
                        <span className="w-32">{p.category}</span>
                        <span className="w-24">{p.price.toFixed(2)} TND</span>
                        <div className="w-32 text-right">
                           <button onClick={() => openFormForEdit(p)} className="text-blue-600 hover:underline mr-4">Modifier</button>
                           <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Supprimer</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProductForm: React.FC<{ product: Product | null; onSave: (p: Product) => void; onCancel: () => void; }> = ({ product, onSave, onCancel }) => {
    const [formState, setFormState] = useState<Omit<Product, 'id' | 'rating' | 'reviewCount'>>(
        product || { name: '', category: 'Bijoux', price: 0, description: '', details: { material: '', dimensions: '', care: ''}, imageUrl: '', images: [], isNew: false, isBestSeller: false, isOnSale: false, salePrice: undefined }
    );
    const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formState,
            id: product?.id || '',
            rating: product?.rating || 0,
            reviewCount: product?.reviewCount || 0,
        });
    };
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setImagePreview(base64);
            handleChange('imageUrl', base64);
        }
    };

    const handleChange = (field: keyof Omit<Product, 'id' | 'rating' | 'reviewCount' | 'details'>, value: any) => {
        setFormState(prev => ({...prev, [field]: value}));
    };
    
    const handleDetailChange = (field: keyof Product['details'], value: string) => {
        setFormState(prev => ({...prev, details: {...prev.details, [field]: value}}));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-2xl font-bold">{product ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
            <input type="text" placeholder="Nom du produit" value={formState.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" required />
            <select value={formState.category} onChange={e => handleChange('category', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900">
                <option value="Bijoux">Bijoux</option>
                <option value="Coffrets">Coffrets</option>
                <option value="Accessoires">Accessoires</option>
                <option value="Personnalisés">Personnalisés</option>
            </select>
            <input type="number" step="0.01" placeholder="Prix" value={formState.price} onChange={e => handleChange('price', parseFloat(e.target.value))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" required />
            <textarea placeholder="Description" value={formState.description} onChange={e => handleChange('description', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" rows={4} />
            
            <div>
                 <label className="block font-medium mb-1">Image principale</label>
                 <input type="file" accept="image/*" onChange={handleImageChange} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" />
                 {imagePreview && <img src={imagePreview} alt="Aperçu" className="w-32 h-32 object-cover rounded mt-2" />}
            </div>

            <div className="flex gap-4 items-center"><input type="checkbox" checked={formState.isNew} onChange={e => handleChange('isNew', e.target.checked)} className="h-4 w-4" /><span>Nouveau produit</span></div>
            <div className="flex gap-4 items-center"><input type="checkbox" checked={formState.isBestSeller} onChange={e => handleChange('isBestSeller', e.target.checked)} className="h-4 w-4"/><span>Meilleure vente</span></div>
            <div className="flex gap-4 items-center"><input type="checkbox" checked={formState.isOnSale} onChange={e => handleChange('isOnSale', e.target.checked)} className="h-4 w-4"/><span>En solde</span></div>
            <p className="text-sm text-secondary mt-2 -mb-2">Cocher ces cases affichera le produit dans les sections correspondantes sur la page d'accueil.</p>

            {formState.isOnSale && <input type="number" step="0.01" placeholder="Prix soldé" value={formState.salePrice} onChange={e => handleChange('salePrice', parseFloat(e.target.value))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />}

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-stone-200 text-primary font-bold py-2 px-4 rounded-md">Annuler</button>
                <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover">Sauvegarder</button>
            </div>
        </form>
    );
};

const AdminOrders: React.FC<{ orders: Order[] }> = ({ orders }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Commandes</h1>
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
            {orders.length > 0 ? [...orders].reverse().map(o => (
                <div key={o.id} className="border border-rose-100 p-4 rounded">
                    <p><strong>ID:</strong> {o.id}</p>
                    <p><strong>Client:</strong> {o.customer.firstName} {o.customer.lastName} ({o.customer.email})</p>
                    <p><strong>Total:</strong> {o.total.toFixed(2)} TND</p>
                    <p><strong>Date:</strong> {o.date.toLocaleString('fr-FR')}</p>
                </div>
            )) : <p>Aucune commande pour le moment.</p>}
        </div>
    </div>
);

const AdminClients: React.FC<{ users: User[] }> = ({ users }) => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Clients Enregistrés</h1>
        <div className="bg-white p-4 rounded-lg shadow-md">
             {users.length > 0 ? users.map(user => (
                <div key={user.id} className="border-b border-rose-100 py-3 last:border-b-0">
                    <p className="font-semibold text-lg">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-secondary">{user.email}</p>
                </div>
            )) : <p className="text-secondary">Aucun client enregistré pour le moment.</p>}
        </div>
    </div>
);

const AdminContentManager: React.FC<{
    content: SiteContent;
    setContent: React.Dispatch<React.SetStateAction<SiteContent>>;
    pages: CustomPageData[];
    setPages: React.Dispatch<React.SetStateAction<CustomPageData[]>>;
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
    adminPassword: string;
    setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
}> = ({ content, setContent, pages, setPages, settings, setSettings, adminPassword, setAdminPassword }) => {
    const [activeTab, setActiveTab] = useState('accueil');
    const [localContent, setLocalContent] = useState(content);
    const [localSettings, setLocalSettings] = useState(settings);
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(content.heroImageUrl);
    const [universeImagePreview, setUniverseImagePreview] = useState<string | null>(content.universeImageUrl);

    useEffect(() => {
        setLocalContent(content);
        setHeroImagePreview(content.heroImageUrl);
        setUniverseImagePreview(content.universeImageUrl);
    }, [content]);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = () => {
        setContent(localContent);
        setSettings(localSettings);
        alert('Contenu sauvegardé !');
    };

    const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setHeroImagePreview(base64);
            setLocalContent(prev => ({ ...prev, heroImageUrl: base64, heroMediaType: 'image' }));
        }
    };
    
    const handleUniverseImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setUniverseImagePreview(base64);
            setLocalContent(prev => ({ ...prev, universeImageUrl: base64 }));
        }
    };
    
    const renderContent = () => {
      switch(activeTab) {
        case 'accueil': return <AdminHomepageContent localContent={localContent} setLocalContent={setLocalContent} heroImagePreview={heroImagePreview} handleHeroImageChange={handleHeroImageChange} universeImagePreview={universeImagePreview} handleUniverseImageChange={handleUniverseImageChange} />;
        case 'boutique': return <AdminShopContent localContent={localContent} setLocalContent={setLocalContent} />;
        case 'pages': return <AdminPagesContent pages={pages} setPages={setPages} />;
        case 'reglages': return <AdminGeneralSettings settings={localSettings} setSettings={setLocalSettings} adminPassword={adminPassword} setAdminPassword={setAdminPassword} />;
        default: return null;
      }
    };

    const tabs = [
        { id: 'accueil', label: "Page d'accueil" },
        { id: 'boutique', label: 'Page Boutique' },
        { id: 'pages', label: 'Autres Pages' },
        { id: 'reglages', label: 'Réglages Généraux'}
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestionnaire de Contenu</h1>
                <button onClick={handleSave} className="bg-accent text-white font-bold py-2 px-6 rounded-md hover:bg-accent-hover">Sauvegarder les modifications</button>
            </div>

            <div className="flex border-b border-rose-200 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 font-medium text-lg whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'text-secondary hover:text-primary'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
                {renderContent()}
            </div>
        </div>
    );
};

const AdminHomepageContent: React.FC<{
    localContent: SiteContent,
    setLocalContent: React.Dispatch<React.SetStateAction<SiteContent>>,
    heroImagePreview: string | null,
    handleHeroImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    universeImagePreview: string | null,
    handleUniverseImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
}> = ({ localContent, setLocalContent, heroImagePreview, handleHeroImageChange, universeImagePreview, handleUniverseImageChange }) => (
    <>
        <div className="border-b border-rose-100 pb-6">
            <h3 className="text-xl font-bold mb-4">Bannière d'Accueil</h3>
            <div>
                <label className="block font-bold mb-1">Slogan Principal</label>
                <input type="text" value={localContent.heroSlogan} onChange={e => setLocalContent(c => ({...c, heroSlogan: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">Sous-titre</label>
                <input type="text" value={localContent.heroSubtitle} onChange={e => setLocalContent(c => ({...c, heroSubtitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
             <div className="mt-4">
                <label className="block font-bold mb-1">Texte du bouton</label>
                <input type="text" value={localContent.heroButtonText} onChange={e => setLocalContent(c => ({...c, heroButtonText: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">URL Vidéo</label>
                <input type="text" value={localContent.heroVideoUrl} onChange={e => setLocalContent(c => ({...c, heroVideoUrl: e.target.value, heroMediaType: 'video'}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">Image de la Bannière (remplace la vidéo si chargée)</label>
                <input type="file" accept="image/*" onChange={handleHeroImageChange} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" />
                {heroImagePreview && <img src={heroImagePreview} alt="Aperçu Bannière" className="w-48 h-auto object-cover rounded mt-2" />}
            </div>
        </div>
         <div className="border-b border-rose-100 pb-6">
            <h3 className="text-xl font-bold mb-4">Titres des Sections de Produits</h3>
            <div>
                <label className="block font-bold mb-1">Titre "Nouveautés"</label>
                <input type="text" value={localContent.newArrivalsTitle} onChange={e => setLocalContent(c => ({...c, newArrivalsTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">Titre "Meilleures Ventes"</label>
                <input type="text" value={localContent.bestSellersTitle} onChange={e => setLocalContent(c => ({...c, bestSellersTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">Titre "Offres Spéciales"</label>
                <input type="text" value={localContent.specialOffersTitle} onChange={e => setLocalContent(c => ({...c, specialOffersTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
        </div>
        <div className="border-b border-rose-100 pb-6">
             <h3 className="text-xl font-bold mb-4">Section "Notre Univers"</h3>
              <div>
                <label className="block font-bold mb-1">Titre</label>
                <input type="text" value={localContent.universeTitle} onChange={e => setLocalContent(c => ({...c, universeTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
             <div className="mt-4">
                <label className="block font-bold mb-1">Texte</label>
                <input type="text" value={localContent.universeText} onChange={e => setLocalContent(c => ({...c, universeText: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
             <div className="mt-4">
                <label className="block font-bold mb-1">Texte du bouton</label>
                <input type="text" value={localContent.universeButtonText} onChange={e => setLocalContent(c => ({...c, universeButtonText: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">Image de fond</label>
                <input type="file" accept="image/*" onChange={handleUniverseImageChange} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" />
                {universeImagePreview && <img src={universeImagePreview} alt="Aperçu Univers" className="w-48 h-auto object-cover rounded mt-2" />}
            </div>
        </div>
        <div className="border-b border-rose-100 pb-6">
            <h3 className="text-xl font-bold mb-4">Titres des Sections d'Engagement</h3>
            <div>
                <label className="block font-bold mb-1">Titre "Avis Clients"</label>
                <input type="text" value={localContent.customerReviewTitle} onChange={e => setLocalContent(c => ({...c, customerReviewTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
            <div className="mt-4">
                <label className="block font-bold mb-1">Titre "Actualités"</label>
                <input type="text" value={localContent.socialSectionTitle} onChange={e => setLocalContent(c => ({...c, socialSectionTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
            </div>
        </div>
    </>
);

const AdminShopContent: React.FC<{
    localContent: SiteContent,
    setLocalContent: React.Dispatch<React.SetStateAction<SiteContent>>,
}> = ({ localContent, setLocalContent }) => (
    <div>
        <h3 className="text-xl font-bold mb-4">Page Boutique</h3>
        <div>
            <label className="block font-bold mb-1">Titre de la page</label>
            <input type="text" value={localContent.shopTitle} onChange={e => setLocalContent(c => ({...c, shopTitle: e.target.value}))} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" />
        </div>
    </div>
);

const AdminPagesContent: React.FC<{ pages: CustomPageData[], setPages: React.Dispatch<React.SetStateAction<CustomPageData[]>> }> = ({ pages, setPages }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<CustomPageData | null>(null);

    const handleSave = (pageToSave: CustomPageData) => {
        if (editingPage) {
            setPages(prev => prev.map(p => p.id === pageToSave.id ? pageToSave : p));
        } else {
            setPages(prev => [...prev, { ...pageToSave, id: `page_${Date.now()}` }]);
        }
        setIsFormOpen(false);
        setEditingPage(null);
    };

    const handleDelete = (pageId: string) => {
        if (['about', 'contact'].includes(pages.find(p=>p.id === pageId)?.slug || '')) {
            alert('Vous ne pouvez pas supprimer les pages principales "À Propos" et "Contact".');
            return;
        }
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
            setPages(prev => prev.filter(p => p.id !== pageId));
        }
    };
    
    if (isFormOpen) {
        return <PageForm page={editingPage} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setEditingPage(null); }} />;
    }
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Gérer les Pages</h3>
                <button onClick={() => setIsFormOpen(true)} className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover">Ajouter une page</button>
            </div>
             <div className="bg-white rounded-lg">
                {pages.map(p => (
                    <div key={p.id} className="flex items-center border-b border-rose-100 py-2 last:border-b-0">
                        <span className="flex-1 font-semibold">{p.title}</span>
                        <span className="text-sm text-secondary mr-4">/{p.slug}</span>
                         <div className="text-right">
                           <button onClick={() => { setEditingPage(p); setIsFormOpen(true); }} className="text-blue-600 hover:underline mr-4">Modifier</button>
                           <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Supprimer</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PageForm: React.FC<{ page: CustomPageData | null; onSave: (p: CustomPageData) => void; onCancel: () => void; }> = ({ page, onSave, onCancel }) => {
    const [formState, setFormState] = useState(page || { id: '', slug: '', title: '', content: ''});
    const isCorePage = useMemo(() => page && ['about', 'contact'].includes(page.slug), [page]);

    useEffect(() => {
        setFormState(page || { id: '', slug: '', title: '', content: ''});
    }, [page]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-2xl font-bold">{page ? 'Modifier la page' : 'Ajouter une page'}</h2>
            <input type="text" placeholder="Titre de la page" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" required />
            <input type="text" placeholder="slug-de-la-page (ex: politique-livraison)" value={formState.slug} disabled={isCorePage} onChange={e => setFormState({...formState, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className={`w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500 ${isCorePage ? 'bg-stone-100 cursor-not-allowed' : ''}`} required />
            {isCorePage && <p className="text-sm text-secondary">Le slug des pages principales ne peut pas être modifié.</p>}
            <textarea placeholder="Contenu de la page (HTML supporté)" value={formState.content} onChange={e => setFormState({...formState, content: e.target.value})} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900 placeholder-gray-500" rows={10} />
             <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="bg-stone-200 text-primary font-bold py-2 px-4 rounded-md">Annuler</button>
                <button type="submit" className="bg-accent text-white font-bold py-2 px-4 rounded-md hover:bg-accent-hover">Sauvegarder</button>
            </div>
        </form>
    );
};

const AdminGeneralSettings: React.FC<{
    settings: SiteSettings;
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
    adminPassword: string;
    setAdminPassword: React.Dispatch<React.SetStateAction<string>>;
}> = ({ settings, setSettings, adminPassword, setAdminPassword }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleSocialChange = (platform: 'instagram' | 'facebook' | 'tiktok', value: string) => {
        setSettings(prev => ({...prev, socialLinks: {...prev.socialLinks, [platform]: value}}));
    };

    const handlePopupChange = (field: keyof SiteSettings['popup'], value: any) => {
        setSettings(prev => ({...prev, popup: {...prev.popup, [field]: value}}));
    };
    
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });

        if (currentPassword !== adminPassword) {
            setPasswordMessage({ type: 'error', text: 'Le mot de passe actuel est incorrect.' });
            return;
        }
        if (!newPassword) {
             setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe ne peut pas être vide.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        setAdminPassword(newPassword);
        setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <>
            <div className="border-b border-rose-100 pb-6">
                <h3 className="text-xl font-bold mb-4">Liens des Réseaux Sociaux</h3>
                <div className="space-y-4">
                    <div><label className="block font-bold mb-1">Instagram</label><input type="text" value={settings.socialLinks.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" /></div>
                    <div><label className="block font-bold mb-1">Facebook</label><input type="text" value={settings.socialLinks.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" /></div>
                    <div><label className="block font-bold mb-1">TikTok</label><input type="text" value={settings.socialLinks.tiktok} onChange={e => handleSocialChange('tiktok', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" /></div>
                </div>
            </div>
             <div className="pt-6 border-b border-rose-100 pb-6">
                <h3 className="text-xl font-bold mb-4">Pop-up Marketing</h3>
                <div className="flex items-center gap-4 mb-4"><input type="checkbox" checked={settings.popup.enabled} onChange={e => handlePopupChange('enabled', e.target.checked)} className="h-4 w-4" /><span>Activer la pop-up</span></div>
                {settings.popup.enabled && (
                    <div className="space-y-4">
                        <div><label className="block font-bold mb-1">Titre</label><input type="text" value={settings.popup.title} onChange={e => handlePopupChange('title', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" /></div>
                        <div><label className="block font-bold mb-1">Texte</label><textarea value={settings.popup.text} onChange={e => handlePopupChange('text', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" rows={3}/></div>
                        <div><label className="block font-bold mb-1">Texte du bouton</label><input type="text" value={settings.popup.buttonText} onChange={e => handlePopupChange('buttonText', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" /></div>
                        <div><label className="block font-bold mb-1">Lien du bouton</label><input type="text" value={settings.popup.buttonLink} onChange={e => handlePopupChange('buttonLink', e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" /></div>
                    </div>
                )}
            </div>
             <div className="pt-6">
                <h3 className="text-xl font-bold mb-4">Changer le mot de passe</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block font-bold mb-1">Mot de passe actuel</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" required />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Nouveau mot de passe</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" required />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">Confirmer le nouveau mot de passe</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2 border border-rose-200 rounded bg-white text-gray-900" required />
                    </div>
                    {passwordMessage.text && (
                        <p className={`text-sm ${passwordMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{passwordMessage.text}</p>
                    )}
                    <div className="text-right">
                         <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-secondary">Changer le mot de passe</button>
                    </div>
                </form>
            </div>
        </>
    );
};

const AdminBar: React.FC<{ navigate: (page: string) => void }> = ({ navigate }) => (
    <div className="bg-primary text-white py-2 px-6 flex justify-between items-center text-sm z-50 sticky top-0">
        <span>Vous êtes connecté en tant qu'administrateur.</span>
        <div>
            <a href="#" onClick={e => {e.preventDefault(); navigate('admin-dashboard')}} className="font-bold hover:text-accent mr-4">Tableau de bord</a>
            <a href="#" onClick={e => {e.preventDefault(); navigate('home')}} className="font-bold hover:text-accent">Voir le site</a>
        </div>
    </div>
);


// --- MAIN APP ---

export default function App() {
    const [page, setPage] = useState<Page>({ name: 'home' });
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [siteContent, setSiteContent] = useState<SiteContent>(INITIAL_SITE_CONTENT);
    const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
    const [customPages, setCustomPages] = useState<CustomPageData[]>(INITIAL_CUSTOM_PAGES);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>(INITIAL_SOCIAL_POSTS);
    const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminPassword, setAdminPassword] = useState('ca123');

    // User Authentication State
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);


    const navigate = useCallback((name: string, identifier?: string) => {
        const newPage: Page = { name };
        if (name === 'product') newPage.productId = identifier;
        if (name === 'custom-page') newPage.slug = identifier;
        setPage(newPage);
        window.scrollTo(0, 0);
    }, []);

    const addToCart = useCallback((product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, []);
    
    const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }, []);

    const removeFromCart = useCallback((productId: string) => setCart(prevCart => prevCart.filter(item => item.id !== productId)), []);
    
    const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    const addReview = useCallback((productId: string, author: string, rating: number, comment: string) => {
        const newReview: Review = {
            id: `rev_${Date.now()}`,
            productId,
            author,
            rating,
            comment,
            date: new Date(),
        };
        setReviews(prev => [newReview, ...prev]);
    }, []);

    const handleAdminLogin = (password: string): boolean => {
        if (password === adminPassword) {
            setIsAdmin(true);
            navigate('admin-dashboard');
            return true;
        }
        return false;
    };

    const handleAdminLogout = () => {
        setIsAdmin(false);
        navigate('home');
    };
    
    // --- User Auth Handlers ---
    const handleUserSignup = (firstName: string, lastName: string, email: string, pass: string): boolean => {
        if (users.some(u => u.email === email)) {
            return false; // Email already exists
        }
        const newUser: User = {
            id: `user_${Date.now()}`,
            firstName,
            lastName,
            email,
            password: pass, // In a real app, this would be hashed
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        navigate('home');
        return true;
    };

    const handleUserLogin = (email: string, pass: string): boolean => {
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            setCurrentUser(user);
            navigate('home');
            return true;
        }
        return false;
    };

    const handleUserLogout = () => {
        setCurrentUser(null);
        navigate('home');
    };


    const handleAddOrder = (customer: CustomerInfo) => {
        const newOrder: Order = {
            id: `order_${Date.now()}`,
            customer,
            items: cart,
            total: cart.reduce((acc, item) => acc + (item.salePrice ?? item.price) * item.quantity, 0),
            date: new Date()
        };
        
        console.log("--- NOUVELLE COMMANDE REÇUE (Simulation d'email) ---");
        console.log(`Commande ID: ${newOrder.id}`);
        console.log(`Date: ${newOrder.date.toLocaleString('fr-FR')}`);
        console.log(`Client: ${customer.firstName} ${customer.lastName} (${customer.email})`);
        console.log(`Téléphone: ${customer.phone}`);
        console.log(`Adresse: ${customer.address}, ${customer.city}, ${customer.zip}`);
        console.log("Détails des articles:");
        newOrder.items.forEach(item => {
            console.log(`- ${item.name} x ${item.quantity} = ${( (item.salePrice ?? item.price) * item.quantity).toFixed(2)} TND`);
        });
        console.log(`Total: ${newOrder.total.toFixed(2)} TND`);
        console.log("-----------------------------------------------------");

        setOrders(prev => [...prev, newOrder]);
        setCart([]);
        navigate('confirmation');
    };

    useEffect(() => {
        if (isAdmin && page.name === 'admin-login') {
            navigate('admin-dashboard');
        }
    }, [isAdmin, page, navigate]);
    

    // --- Page Rendering Logic ---
    const renderPage = () => {
        const isAnAdminPage = page.name.startsWith('admin');

        if (isAnAdminPage) {
            if (!isAdmin && page.name !== 'admin-login') {
                 return <AdminLoginPage handleLogin={handleAdminLogin} />;
            }
            if (page.name === 'admin-login' && isAdmin) {
                return null;
            }
             if (page.name === 'admin-login' && !isAdmin) {
                 return <AdminLoginPage handleLogin={handleAdminLogin} />;
            }

            let adminPageContent;
            switch(page.name) {
                case 'admin-products':
                    adminPageContent = <AdminProducts products={products} setProducts={setProducts} />;
                    break;
                case 'admin-orders':
                    adminPageContent = <AdminOrders orders={orders} />;
                    break;
                 case 'admin-clients':
                    adminPageContent = <AdminClients users={users} />;
                    break;
                case 'admin-content':
                    adminPageContent = <AdminContentManager content={siteContent} setContent={setSiteContent} pages={customPages} setPages={setCustomPages} settings={siteSettings} setSettings={setSiteSettings} adminPassword={adminPassword} setAdminPassword={setAdminPassword}/>;
                    break;
                case 'admin-dashboard':
                default:
                    adminPageContent = <AdminDashboard orders={orders} products={products} users={users} />;
                    break;
            }
            return (
                <AdminLayout navigate={navigate} handleLogout={handleAdminLogout} pageName={page.name}>
                    {adminPageContent}
                </AdminLayout>
            );
        }

        // --- Public Page Rendering ---
        let publicPageContent;

        switch (page.name) {
            case 'shop':
                publicPageContent = <ShopPage title={siteContent.shopTitle} navigate={navigate} products={products} addToCart={addToCart} />;
                break;
            case 'product': {
                const product = products.find(p => p.id === page.productId);
                publicPageContent = product 
                    ? <ProductPage product={product} addToCart={addToCart} reviews={reviews} addReview={addReview} />
                    : <div className="text-center py-24">Produit non trouvé</div>;
                break;
            }
            case 'custom-page': {
                const customPage = customPages.find(p => p.slug === page.slug);
                publicPageContent = <CustomPageRenderer page={customPage} />;
                break;
            }
            case 'cart':
                publicPageContent = <CartPage cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} navigate={navigate} />;
                break;
            case 'checkout':
                publicPageContent = <CheckoutPage handleAddOrder={handleAddOrder} cart={cart} />;
                break;
            case 'confirmation':
                publicPageContent = <ConfirmationPage navigate={navigate} />;
                break;
            case 'signup':
                publicPageContent = <SignupPage handleSignup={handleUserSignup} navigate={navigate} />;
                break;
            case 'login':
                publicPageContent = <LoginPage handleLogin={handleUserLogin} navigate={navigate} />;
                break;
            case 'home':
            default:
                publicPageContent = <HomePage navigate={navigate} products={products} content={siteContent} addToCart={addToCart} socialPosts={socialPosts} reviews={reviews} />;
                break;
        }


        return (
            <div className="font-sans">
                {isAdmin && <AdminBar navigate={navigate} />}
                <Header navigate={navigate} cartItemCount={cartItemCount} customPages={customPages} currentUser={currentUser} handleUserLogout={handleUserLogout} />
                <main>{publicPageContent}</main>
                <Footer navigate={navigate} customPages={customPages} siteSettings={siteSettings} />
                <MarketingPopup settings={siteSettings.popup} navigate={navigate} />
            </div>
        );
    };

    return renderPage();
}
