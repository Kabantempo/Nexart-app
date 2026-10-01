import React from 'react';
import { Image, View } from 'react-native';

/**
 * Symbole Nexart sur pastille blanche arrondie (charte v1.3.2 : le bas du ruban est presque
 * de la couleur du fond sombre, le symbole seul s'y perd). Rayon 15 %, symbole à 80 %.
 */
export default function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Nexart"
      style={{ width: size, height: size, borderRadius: size * 0.15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}
    >
      <Image source={require('../../../assets/nexart-icon-512.png')} style={{ width: size * 0.8, height: size * 0.8 }} resizeMode="contain" />
    </View>
  );
}
