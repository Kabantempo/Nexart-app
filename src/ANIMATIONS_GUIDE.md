# 🎬 Guide des Animations Nexart

## Composants disponibles

### 1️⃣ **AnimatedCard**
Fade + slide up animation pour listes

```tsx
import { AnimatedCard } from '@/components/AnimatedCard'

<AnimatedCard index={0}>
  <Text>Mon contenu</Text>
</AnimatedCard>
```

### 2️⃣ **Toast**
Notifications avec slide up

```tsx
import { Toast } from '@/components/Toast'

<Toast 
  visible={true}
  message="Success!" 
  type="success"
  duration={3000}
/>
```

### 3️⃣ **Skeleton**
Loading placeholders avec shimmer

```tsx
import { Skeleton, SkeletonGroup } from '@/components/Skeleton'

<Skeleton height={150} width="100%" />
<SkeletonGroup />
```

### 4️⃣ **EmptyState**
"Aucun résultat" avec bounce animation

```tsx
import { EmptyState } from '@/components/EmptyState'

<EmptyState 
  icon="search"
  title="Aucun résultat"
  subtitle="Essayez une autre recherche"
/>
```

### 5️⃣ **ShakeAnimation**
Shake effect pour erreurs

```tsx
import { ShakeAnimation, PulseButton } from '@/components/ShakeAnimation'

<ShakeAnimation trigger={hasError}>
  <TextInput />
</ShakeAnimation>

<PulseButton onPress={handleSubmit}>
  <Text>Soumettre</Text>
</PulseButton>
```

### 6️⃣ **ScrollAnimations**
Parallax header + fade

```tsx
import { AnimatedScrollView } from '@/components/ScrollAnimations'

<AnimatedScrollView>
  <Text>Mon contenu</Text>
</AnimatedScrollView>
```

### 7️⃣ **Navigation Transitions**
Page transitions fluides dans navigator

```tsx
import { pageTransitionOptions } from '@/lib/navigationConfig'

// Dans Stack.Navigator
<Stack.Navigator screenOptions={pageTransitionOptions}>
  ...
</Stack.Navigator>
```

## Timing Constants

```
ANIMATION_DURATIONS.fast       = 150ms   (quick feedback)
ANIMATION_DURATIONS.base       = 200ms   (standard)
ANIMATION_DURATIONS.slow       = 300ms   (prominent)
ANIMATION_DURATIONS.verySlow   = 500ms   (hero intro)
```

## Exemples d'intégration

### Liste avec animations
```tsx
<AnimatedCard index={idx}>
  <TouchableOpacity>
    <EventCard event={event} />
  </TouchableOpacity>
</AnimatedCard>
```

### Loading avec Skeleton
```tsx
{loading ? (
  <SkeletonGroup />
) : (
  <EventList />
)}
```

### Feedback utilisateur
```tsx
const [toast, setToast] = useState(false)

const handleSubmit = async () => {
  try {
    await saveForm()
    setToast({ visible: true, type: 'success', message: 'Saved!' })
  } catch (error) {
    setToast({ visible: true, type: 'error', message: 'Error!' })
  }
}

<Toast {...toast} />
```

## Performance Tips

- ✅ Utiliser `useNativeDriver: true` pour animations
- ✅ Limiter le nombre d'animations simultanées
- ✅ Utiliser `scrollEventThrottle` sur ScrollView
- ✅ Utiliser index prop pour stagger animations

## Next Steps

1. Intégrer Toast dans les forms
2. Ajouter Skeleton à CreatorCard loading
3. Ajouter EmptyState aux listes vides
4. Intégrer page transitions dans navigateurs
