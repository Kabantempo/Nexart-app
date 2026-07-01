export type Article = {
  id: string
  title: string
  excerpt: string
  category: 'créateurs' | 'organisateurs' | 'actualités'
  readTime: number
  date: string
  slug: string
  icon: string
  tags: string[]
  image?: string
}

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Comment préparer son stand pour un marché artisanal',
    excerpt: 'De la scénographie à la signalétique, tout ce qu\'il faut savoir pour attirer le chaland et maximiser vos ventes le jour J.',
    category: 'créateurs',
    readTime: 7,
    date: '2026-06-01',
    slug: 'preparer-stand-marche',
    icon: '🏕️',
    tags: ['Stand', 'Merchandising', 'Conseils'],
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&h=630&fit=crop',
  },
  {
    id: '2',
    title: 'Fixer ses prix en tant qu\'artisan : la méthode complète',
    excerpt: 'Coût matière, temps de travail, valeur perçue… Apprenez à calculer des prix justes qui valorisent votre savoir-faire.',
    category: 'créateurs',
    readTime: 9,
    date: '2026-05-24',
    slug: 'fixer-ses-prix-artisan',
    icon: '💰',
    tags: ['Tarification', 'Gestion', 'Business'],
    image: 'https://images.unsplash.com/photo-1526628652108-aa545b6c60f0?w=1200&h=630&fit=crop',
  },
  {
    id: '3',
    title: 'Photographier son travail : guide complet pour l\'artisan',
    excerpt: 'Lumière naturelle, angles de vue, mise en scène… Les techniques pro pour valoriser vos créations sur Nexart.',
    category: 'créateurs',
    readTime: 8,
    date: '2026-05-15',
    slug: 'photographier-travail-artisan',
    icon: '📸',
    tags: ['Photo', 'Portfolio', 'Marketing'],
    image: 'https://images.unsplash.com/photo-1600080869266-f12707903a0f?w=1200&h=630&fit=crop',
  },
  {
    id: '4',
    title: 'Top 10 des marchés artisanaux incontournables en 2026',
    excerpt: 'Les meilleurs rendez-vous du calendrier artisanal français pour exposer et vendre votre création.',
    category: 'actualités',
    readTime: 6,
    date: '2026-05-08',
    slug: 'top-marches-2026',
    icon: '🏪',
    tags: ['Marchés', 'Calendrier', 'Opportunités'],
    image: 'https://images.unsplash.com/photo-1552668473-d5b604d0c90d?w=1200&h=630&fit=crop',
  },
  {
    id: '5',
    title: 'Comment attirer des créateurs talentueux sur votre marché',
    excerpt: 'Stratégies et bonnes pratiques pour les organisateurs : sélection, communication, animation.',
    category: 'organisateurs',
    readTime: 7,
    date: '2026-04-28',
    slug: 'attirer-createurs',
    icon: '🎯',
    tags: ['Organisateurs', 'Marketing', 'Recrutement'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop',
  },
  {
    id: '6',
    title: 'Gérer efficacement les candidatures : tout ce qu\'il faut savoir',
    excerpt: 'Organisation, communication, négociation : le guide complet pour les organisateurs de marchés.',
    category: 'organisateurs',
    readTime: 6,
    date: '2026-04-18',
    slug: 'gerer-candidatures',
    icon: '📋',
    tags: ['Organisateurs', 'Gestion', 'Candidatures'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop',
  },
  {
    id: '7',
    title: 'L\'ambiance d\'un marché : créer une expérience unique',
    excerpt: 'Décoration, musique, accueil… Comment transformer un marché en événement mémorable.',
    category: 'organisateurs',
    readTime: 5,
    date: '2026-04-08',
    slug: 'ambiance-marche',
    icon: '✨',
    tags: ['Événement', 'Expérience', 'Animation'],
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=630&fit=crop',
  },
  {
    id: '8',
    title: 'Vérification SIRET et assurances : ce qu\'il faut pour vendre',
    excerpt: 'Obligations légales, documents nécessaires, où les obtenir : le checklist complet du créateur.',
    category: 'actualités',
    readTime: 6,
    date: '2026-03-28',
    slug: 'nexart-verification',
    icon: '✅',
    tags: ['Légal', 'SIRET', 'Assurance'],
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b83ad45?w=1200&h=630&fit=crop',
  },
  {
    id: '9',
    title: 'Tendances artisanales 2026 : à la croisée du tradition et du digital',
    excerpt: 'Matériaux durables, techniques hybrides, vente en ligne… Ce qui bouge dans l\'artisanat cette année.',
    category: 'actualités',
    readTime: 8,
    date: '2026-03-15',
    slug: 'tendances-2026',
    icon: '🔮',
    tags: ['Tendances', 'Marché', 'Futur'],
    image: 'https://images.unsplash.com/photo-1579783902614-e3fb5141b0cb?w=1200&h=630&fit=crop',
  },
]
