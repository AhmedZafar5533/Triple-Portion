import React, { useState } from 'react';
import TourList from './TourList';
import TourForm from './TourForm';
import { motion, AnimatePresence } from 'framer-motion';

const TourManagement = () => {
    const [view, setView] = useState('list'); // 'list', 'form'
    const [selectedTour, setSelectedTour] = useState(null);

    const handleEdit = (tour) => {
        setSelectedTour(tour);
        setView('form');
    };

    const handleAdd = () => {
        setSelectedTour(null);
        setView('form');
    };

    const handleComplete = () => {
        setView('list');
        setSelectedTour(null);
    };

    return (
        <div className="min-h-screen">
            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <TourList onEdit={handleEdit} onAdd={handleAdd} />
                    </motion.div>
                )}

                {view === 'form' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <TourForm 
                            product={selectedTour} 
                            onCancel={() => setView('list')} 
                            onComplete={handleComplete} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TourManagement;
