import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');
const prefixes = [prefix, 'nexart://', 'https://nexart.app'];

const discoverScreens = {
  DiscoverHome:         'discover',
  PublicEventDetail:    'event/:eventId',
  PublicCreatorProfile: 'creator/:creatorId',
  EventMap:             'map',
};

// Config pour utilisateurs non-authentifiés
export const unauthLinking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes,
  config: {
    screens: {
      Auth:     { screens: {} },
      Discover: { screens: discoverScreens },
    },
  },
};

// Config pour visiteurs authentifiés
export const visitorLinking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes,
  config: {
    screens: {
      Visitor: {
        screens: {
          'Découvrir': { screens: discoverScreens },
        },
      },
    },
  },
};

// Config pour créateurs authentifiés
export const creatorLinking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes,
  config: {
    screens: {
      Creator: {
        screens: {
          'Marchés': {
            screens: {
              EventList:   'events',
              EventDetail: 'event/:eventId',
            },
          },
        },
      },
    },
  },
};

// Config par défaut (admin, organizer)
export const defaultLinking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes,
  config: { screens: {} },
};
