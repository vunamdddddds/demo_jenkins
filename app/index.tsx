import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleAddNote = (noteText: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText,
      createdAt: new Date(),
    };
    setNotes([...notes, newNote]);
  };
  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleUpdateNote = (updatedText: string) => {
    if (!editingNoteId) return;

    setNotes(notes.map(note =>
      note.id === editingNoteId
        ? { ...note, text: updatedText, updatedAt: new Date() }
        : note
    ));
    setEditingNoteId(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
  };

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('notes');
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes);
          // Convert string dates back to Date objects
          setNotes(parsedNotes.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined
          })));
        }
      } catch (error) {
        console.error('Lỗi khi đọc ghi chú:', error);
      }
    };

    loadNotes();
  }, []);

  useEffect(() => {
    const saveNotes = async () => {
      try {
        await AsyncStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Lỗi khi lưu ghi chú: namvu', error);
      }
    };

    saveNotes();
  }, [notes]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Ứng dụng ghi chú</Text>
      </View>

      <NoteInput
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        editingNote={notes.find(note => note.id === editingNoteId) || null}
        onCancelEdit={handleCancelEdit}
      />
      <NoteList
        notes={notes}
        onDeleteNote={handleDeleteNote}
        onEditNote={handleEditNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ee',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 12,
  },
  editText: {
    color: '#6200ee',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

const inputStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

const listStyles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  deleteText: {
    color: 'red',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 12,
  },
  editText: {
    color: '#6200ee',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

function NoteInput({
  onAddNote,
  onUpdateNote,
  editingNote,
  onCancelEdit
}: {
  onAddNote: (text: string) => void;
  onUpdateNote?: (text: string) => void;
  editingNote?: Note | null;
  onCancelEdit?: () => void;
}) {
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (editingNote) {
      setNoteText(editingNote.text);
    } else {
      setNoteText('');
    }
  }, [editingNote]);

  const handleSubmit = () => {
    if (editingNote && onUpdateNote) {
      onUpdateNote(noteText.trim());
    } else {
      onAddNote(noteText.trim());
    }
    setNoteText('');
  };

  return (
    <View style={inputStyles.container}>
      <TextInput
        style={inputStyles.input}
        value={noteText}
        onChangeText={setNoteText}
        placeholder="Nhập ghi chú của bạn..."
        multiline
      />

      <View style={inputStyles.buttonGroup}>
        {editingNote && (
          <TouchableOpacity
            style={[inputStyles.button, inputStyles.cancelButton]}
            onPress={onCancelEdit}
          >
            <Text style={inputStyles.buttonText}>Hủy</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[inputStyles.button, inputStyles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={inputStyles.buttonText}>
            {editingNote ? 'Cập nhật' : 'Thêm'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NoteList({
  notes,
  onDeleteNote,
  onEditNote
}: {
  notes: Note[];
  onDeleteNote: (id: string) => void;
  onEditNote: (note: Note) => void;
}) {
  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={listStyles.noteItem}>
      <Text>{item.text}</Text>
      <Text style={listStyles.dateText}>
        {item.createdAt.toLocaleDateString()}
        {item.updatedAt && ` (Sửa: ${item.updatedAt.toLocaleDateString()})`}
      </Text>
      <View style={listStyles.actions}>
        <TouchableOpacity
          style={listStyles.editButton}
          onPress={() => onEditNote(item)}
        >
          <Text style={listStyles.editText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={listStyles.deleteButton}
          onPress={() => onDeleteNote(item.id)}
        >
          <Text style={listStyles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={notes}
      renderItem={renderNoteItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={listStyles.listContainer}
    />
  );
}
