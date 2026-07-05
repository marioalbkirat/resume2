// D:\cvBuilder\resumebuilder\src\hooks\sectionBuilder\componenets\DeleteNode.tsx
import { Schema } from '@/types/resume/Section';
import { FiTrash2 } from 'react-icons/fi';
import { useSectionBuilder } from '../useSectionBuilder';
import Swal from 'sweetalert2';
export default function DeleteNode({ node, builder }: { node: Schema; builder: ReturnType<typeof useSectionBuilder>; }) {
    const { deleteNode } = builder;
    return (
        <button onClick={() => { deleteNode(node.id); Swal.fire({ icon: 'success', title: 'Deleted', text: 'Element deleted successfully.', timer: 1200, showConfirmButton: false }); }} className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer">
            <FiTrash2 size={14} />
        </button>
    );
}