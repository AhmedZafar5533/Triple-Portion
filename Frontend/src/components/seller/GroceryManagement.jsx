import React, { useState } from 'react';
import GroceryList from './GroceryList';
import GroceryForm from './GroceryForm';
import { motion, AnimatePresence } from 'framer-motion';

const GroceryManagement = () => {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingProduct, setEditingProduct] = useState(null);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setView('form');
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setView('form');
    };

    const handleComplete = () => {
        setView('list');
        setEditingProduct(null);
    };

    const handleCancel = () => {
        setView('list');
        setEditingProduct(null);
    };

    return (
        <div className="min-h-full">
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <GroceryList onEdit={handleEdit} onAdd={handleAdd} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <GroceryForm 
                            product={editingProduct} 
                            onCancel={handleCancel} 
                            onComplete={handleComplete} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GroceryManagement;
