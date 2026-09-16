import React, { useState } from 'react';
import AccommodationList from './AccommodationList';
import AccommodationForm from './AccommodationForm';
import { motion, AnimatePresence } from 'framer-motion';

const AccommodationManagement = () => {
    const [view, setView] = useState('list'); // 'list', 'form'
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setView('form');
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setView('form');
    };

    const handleComplete = () => {
        setView('list');
        setSelectedProduct(null);
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
                        <AccommodationList onEdit={handleEdit} onAdd={handleAdd} />
                    </motion.div>
                )}

                {view === 'form' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <AccommodationForm 
                            product={selectedProduct} 
                            onCancel={() => setView('list')} 
                            onComplete={handleComplete} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccommodationManagement;
