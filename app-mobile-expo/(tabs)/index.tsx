import { BookShelf } from '@/components/book-shelf';
import { EBookReader } from '@/components/ebook-reader';
import { HeritageBanner } from '@/components/heritage-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { libraryBooks } from '@/data/library';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useReaderPreferences } from '@/hooks/use-reader-preferences';
import type { LibraryBook } from '@/types/library';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LibraryShelfConfig {
  id: string;
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  categories: LibraryBook['category'][];
}

const libraryShelves: LibraryShelfConfig[] = [
  {
    id: 'shelf-history',
    title: 'Lịch Sử & Hồi Ức',
    description: 'Sự kiện, đối thoại và ghi chép về nền cộng hòa.',
    iconName: 'library',
    categories: ['history', 'press'],
  },
  {
    id: 'shelf-culture',
    title: 'Văn Hóa Đô Thị',
    description: 'Nhịp sống Sài Gòn, đời sống cộng đồng, ký ức thường nhật.',
    iconName: 'color-palette',
    categories: ['culture'],
  },
  {
    id: 'shelf-art',
    title: 'Âm Nhạc & Văn Học',
    description: 'Từ phòng trà đêm đến những bản thảo dưới hiên mưa.',
    iconName: 'musical-notes',
    categories: ['music', 'literature'],
  },
];

const archiveSpotlight = {
  title: 'Góc Lưu Trữ Tuần Này',
  venue: 'Thư viện Quốc Gia Sài Gòn',
  schedule: '08:00 - 17:00 (thứ Ba - Chủ nhật)',
  description:
    'Triển lãm chuyên đề giới thiệu bản đồ quân sự, ảnh chụp phòng trà và nhật ký phóng viên trong giai đoạn 1955-1973.',
};

export default function HomeScreen() {
  const [showIntro, setShowIntro] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { readerTheme, themeLabelMap } = useReaderPreferences();
  const [isReading, setIsReading] = useState(false);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Hide/show tab bar based on reading state or if intro is showing
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: {
        display: isReading || showIntro ? 'none' : 'flex',
      },
    });
  }, [isReading, showIntro, navigation]);

  const highlightedBook = libraryBooks[0];
  const continueReading = useMemo(
    () =>
      libraryBooks
        .filter((book) => (book.progress ?? 0) > 0)
        .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0)),
    [],
  );

  const authorCount = useMemo(() => new Set(libraryBooks.map((book) => book.author)).size, []);
  const chapterCount = useMemo(
    () => libraryBooks.reduce((acc, book) => acc + book.chapters.length, 0),
    [],
  );
  const readingHours = useMemo(
    () => Math.ceil(libraryBooks.reduce((acc, book) => acc + (book.readingTimeMinutes ?? 0), 0) / 60),
    [],
  );

  const currentBook = useMemo<LibraryBook | null>(
    () => libraryBooks.find((book) => book.id === activeBookId) ?? null,
    [activeBookId],
  );

  const handleBookPress = (book: LibraryBook) => {
    setActiveBookId(book.id);
    setActiveChapterIndex(0);
    setIsReading(true);
  };

  const handleBackToLibrary = () => {
    setIsReading(false);
    setActiveBookId(null);
  };

  // Render the intro video screen if showIntro is true
  if (showIntro) {
    return (
      <View style={styles.introContainer}>
        <Video
          source={require('@/assets/video/Intro.mp4')}
          rate={1.0}
          volume={1.0}
          isMuted={true} // Mute video by default for better user experience
          resizeMode="cover"
          shouldPlay
          isLooping
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.overlay}>
          <ThemedText type="title" style={styles.introTitle}>
            Di Sản Việt Nam Dân Chủ Cộng Hòa
          </ThemedText>
          <ThemedText style={styles.introSubtitle}>
            Khám phá lịch sử qua tư liệu và hình ảnh
          </ThemedText>
          <TouchableOpacity
            style={[styles.introButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowIntro(false)}
            activeOpacity={0.8}>
            <ThemedText style={[styles.introButtonText, { color: colors.background }]}>
              Vào Thư Viện
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isReading && currentBook) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.readerHeader,
            {
              backgroundColor: colors.cardBackground,
              borderBottomColor: colors.border,
              paddingTop: insets.top + 12,
            },
          ]}
        >
          <TouchableOpacity onPress={handleBackToLibrary} style={styles.readerBackButton}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
            <ThemedText style={styles.readerBackText}>Trở về thư viện</ThemedText>
          </TouchableOpacity>
          <View style={styles.readerMeta}>
            <ThemedText style={styles.readerBook}>{currentBook.title}</ThemedText>
            <ThemedText style={[styles.readerMetaLine, { color: colors.icon }]}>
              Chương {activeChapterIndex + 1}/{currentBook.chapters.length} • Chế độ{' '}
              {themeLabelMap[readerTheme]}
            </ThemedText>
          </View>
        </View>
        <EBookReader book={currentBook} onChapterChange={setActiveChapterIndex} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <HeritageBanner
            title="Thư Viện Việt Nam Dân Chủ Cộng Hòa"
            subtitle="Lưu giữ ký ức, gìn giữ văn hóa"
            description="Khám phá kho tư liệu về lịch sử, âm nhạc, văn chương và báo chí miền Nam 1955-1975. Mỗi tựa sách là một lát cắt ký ức."
            ctaLabel="Đọc ngay"
            onPress={() => handleBookPress(highlightedBook)}
            stats={[
              { value: `${libraryBooks.length}`, label: 'tựa sách' },
              { value: `${chapterCount}`, label: 'chương tư liệu' },
              { value: `${authorCount}`, label: 'tác giả' },
              { value: `${readingHours}+`, label: 'giờ đọc ước tính' },
            ]}
          />

          {continueReading.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Đang đọc dở
                </ThemedText>
                <ThemedText style={[styles.sectionHint, { color: colors.icon }]}>
                  Tiếp tục hành trình còn dang dở
                </ThemedText>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.continueRow}>
                {continueReading.map((book) => (
                  <ContinueReadingCard
                    key={book.id}
                    book={book}
                    colors={colors}
                    onPress={handleBookPress}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {libraryShelves.map((shelf) => {
            const shelfBooks = libraryBooks.filter((book) =>
              shelf.categories.includes(book.category),
            );
            if (shelfBooks.length === 0) {
              return null;
            }
            return (
              <BookShelf
                key={shelf.id}
                title={shelf.title}
                description={shelf.description}
                iconName={shelf.iconName}
                books={shelfBooks}
                onBookPress={handleBookPress}
              />
            );
          })}

          <ThemedView
            style={[
              styles.archiveCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}>
            <View style={styles.archiveHeader}>
              <Ionicons name="archive" size={22} color={colors.tint} />
              <ThemedText type="subtitle" style={styles.archiveTitle}>
                {archiveSpotlight.title}
              </ThemedText>
            </View>
            <ThemedText style={[styles.archiveDescription, { color: colors.icon }]}>
              {archiveSpotlight.description}
            </ThemedText>
            <View style={styles.archiveMetaRow}>
              <View style={styles.archiveMeta}>
                <Ionicons name="location" size={16} color={colors.tint} />
                <ThemedText style={styles.archiveMetaText}>{archiveSpotlight.venue}</ThemedText>
              </View>
              <View style={styles.archiveMeta}>
                <Ionicons name="time" size={16} color={colors.tint} />
                <ThemedText style={styles.archiveMetaText}>{archiveSpotlight.schedule}</ThemedText>
              </View>
            </View>
          </ThemedView>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

interface ContinueReadingCardProps {
  book: LibraryBook;
  colors: typeof Colors.light;
  onPress: (book: LibraryBook) => void;
}

function ContinueReadingCard({ book, colors, onPress }: ContinueReadingCardProps) {
  const progress = book.progress ?? 0;
  return (
    <TouchableOpacity
      style={[
        styles.continueCard,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
      onPress={() => onPress(book)}>
      <View style={[styles.continueFlag, { backgroundColor: book.accentColor ?? colors.accent }]}>
        <View style={[styles.continueStripe, { backgroundColor: book.coverColor ?? colors.tint }]} />
      </View>
      <View style={styles.continueTextBlock}>
        <ThemedText style={styles.continueTitle} numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText style={[styles.continueAuthor, { color: colors.icon }]}>
          {book.author}
        </ThemedText>
      </View>
      <View style={styles.continueProgress}>
        <View style={[styles.continueBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.continueFill,
              { width: `${progress}%`, backgroundColor: book.accentColor ?? colors.tint },
            ]}
          />
        </View>
        <ThemedText style={styles.continuePercent}>{progress}%</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Styles for the new Intro Screen
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  introTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  introButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 999,
  },
  introButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Existing styles
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  continueRow: {
    gap: 12,
    paddingVertical: 4,
  },
  continueCard: {
    width: 220,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginRight: 12,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  continueFlag: {
    width: 42,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  continueStripe: {
    width: '85%',
    height: 8,
    borderRadius: 4,
  },
  continueTextBlock: {
    gap: 4,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  continueAuthor: {
    fontSize: 13,
  },
  continueProgress: {
    marginTop: 12,
  },
  continueBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  continueFill: {
    height: '100%',
    borderRadius: 3,
  },
  continuePercent: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  archiveCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 32,
    gap: 12,
  },
  archiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  archiveTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  archiveDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  archiveMetaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  archiveMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  archiveMetaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  readerHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  readerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readerBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  readerMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },
  readerBook: {
    fontSize: 16,
    fontWeight: '700',
  },
  readerMetaLine: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
