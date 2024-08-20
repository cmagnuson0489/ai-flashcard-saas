import React, { useState, useEffect } from 'react';
import { useUser } from '@some-auth-package'; // Replace with the actual package you're using
import { useRouter, useSearchParams } from 'next/router';
import { doc, collection, getDoc, getDocs, setDoc } from '@firebase/firestore'; // Replace with your actual Firebase import
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState({});
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('id');

    useEffect(() => {
        async function getFlashcards() {
            if (!user) return;

            const docRef = doc(collection(db, 'users'), user.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const collections = docSnap.data().flashcards || [];
                setFlashcards(collections);
            } else {
                await setDoc(docRef, { flashcards: [] });
            }
        }

        async function getFlashcard() {
            if (!search || !user) return;

            const colRef = collection(doc(collection(db, 'users'), user.id), search);
            const docs = await getDocs(colRef);
            const flashcardsList = [];
            docs.forEach((doc) => {
                flashcardsList.push({ id: doc.id, ...doc.data() });
            });
            setFlashcards(flashcardsList);
        }

        if (search) {
            getFlashcard();
        } else {
            getFlashcards();
        }
    }, [search, user]);

    const handleCardClick = (id) => {
        if (search) {
            setFlipped((prev) => ({
                ...prev,
                [id]: !prev[id],
            }));
        } else {
            router.push(`/flashcard?id=${id}`);
        }
    };

    return (
        <Container maxWidth="md">
            <Grid container spacing={3} sx={{ mt: 4 }}>
                {flashcards.map((flashcard) => (
                    <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                        <Card>
                            <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                                <CardContent>
                                    <Box sx={{ /* Add your flip animation styling here */ }}>
                                        <div>
                                            <div>
                                                <Typography variant="h5" component="div">
                                                    {flipped[flashcard.id] ? flashcard.back : flashcard.front}
                                                </Typography>
                                            </div>
                                        </div>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}
