export const posts = [
  {
    id: '1',
    userId: '1',
    content: 'Just finished a great coding session! #programming #javascript',
    image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    visibility: 'public',
    createdAt: '2024-03-15T10:30:00Z',
    likes: ['2', '3'],
    comments: [
      { id: '1', userId: '2', content: 'Great work!', createdAt: '2024-03-15T10:35:00Z' },
      { id: '2', userId: '3', content: 'What were you working on?', createdAt: '2024-03-15T10:40:00Z' }
    ]
  },
  {
    id: '2',
    userId: '2',
    content: 'Beautiful sunset today! 🌅',
    image: 'https://images.pexels.com/photos/1237119/pexels-photo-1237119.jpeg',
    visibility: 'connections',
    createdAt: '2024-03-15T09:00:00Z',
    likes: ['1'],
    comments: []
  },
  {
    id: '3',
    userId: '3',
    content: 'Just started learning React. Any tips?',
    image: null,
    visibility: 'public',
    createdAt: '2024-03-14T15:20:00Z',
    likes: ['1', '2', '4'],
    comments: [
      { id: '3', userId: '1', content: 'Practice makes perfect!', createdAt: '2024-03-14T15:25:00Z' }
    ]
  }
];