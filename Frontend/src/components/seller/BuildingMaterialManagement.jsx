import React, { useState } from 'react';
import BuildingMaterialList from './BuildingMaterialList';
import BuildingMaterialForm from './BuildingMaterialForm';
import { motion, AnimatePresence } from 'framer-motion';

const BuildingMaterialManagement = () => {
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
                        <BuildingMaterialList onEdit={handleEdit} onAdd={handleAdd} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <BuildingMaterialForm 
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

export default BuildingMaterialManagement;
