import ParahumanoSection from './ParahumanoSection';
import EnteSection from './EnteSection';
import MalditoSection from './MalditoSection';
import LiberadoSection from './LiberadoSection';
import WerewolfSection from './WerewolfSection';
import PoseidoSection from './PoseidoSection';
import AlteradoSection from './AlteradoSection';
import MutanteSection from './MutanteSection';
import HibridoSection from './HibridoSection';
import GuardianSection from './GuardianSection';
import DivineSection from './DivineSection';
import MinotaurSection from './MinotaurSection';
import VigilanteTraumasSection from './VigilanteTraumasSection';
import TechnologicalSection from './TechnologicalSection';
import ExoskeletonSection from './ExoskeletonSection';
import ExoskeletonArmorSection from './ExoskeletonArmorSection';
import TechnoSuitStrengthSection from './TechnoSuitStrengthSection';
import { CyborgSection } from './CyborgSection';
import TechModulesSection from './TechModulesSection';
import type { CharacterOriginFlags } from '../utils';
import type { TechModule } from '../types';
import type { ToastType } from '../../../shared/layout/WizardDialogs';

interface OriginSpecificSectionsProps {
    data: any;
    onChange: (updates: any) => void;
    onShowToast?: (message: string, type?: ToastType) => void;
    originFlags: CharacterOriginFlags;
    vigilanteSpecialties: string[];
    techModules: TechModule[];
    onOpenTechModulesModal: () => void;
    onUpdateModuleLocation: (id: string, loc: string) => void;
    onUpdateModuleCost: (id: string, cost: number) => void;
    onRemoveTechModule: (id: string) => void;
    onUpdateTrauma: (spec: string, text: string) => void;
}

export default function OriginSpecificSections({
    data,
    onChange,
    onShowToast,
    originFlags,
    vigilanteSpecialties,
    techModules,
    onOpenTechModulesModal,
    onUpdateModuleLocation,
    onUpdateModuleCost,
    onRemoveTechModule,
    onUpdateTrauma
}: OriginSpecificSectionsProps) {
    const {
        isParahumano,
        isEnte,
        isMaldito,
        activeLiberados,
        isHombreLobo,
        isPoseido,
        isAlterado,
        isMutante,
        isHibrido,
        isGuardian,
        isDios,
        isDiosMenor,
        isMinotauro,
        isTecnologico,
        isExoskeleton,
        isTecnoarmadura,
        isTecnovehiculo,
        isCyborg
    } = originFlags;

    return (
        <>
            {isParahumano && (
                <ParahumanoSection
                    parahumanoParams={data.parahumanoParams || { isHybridWithHuman: false }}
                    onChange={onChange}
                />
            )}

            {isEnte && (
                <EnteSection
                    enteParams={data.enteParams || { formType: null, visualEffect: null }}
                    onChange={onChange}
                />
            )}

            {isMaldito && (
                <MalditoSection
                    malditoParams={data.malditoParams || { magnitude: null, source: null }}
                    onChange={onChange}
                />
            )}

            {activeLiberados.map(subtype => (
                <LiberadoSection
                    key={subtype}
                    subtype={subtype}
                    liberadoParams={data.liberadoParams || { gift: 'none' }}
                    chosenBonusCharacteristic={data.chosenCharacteristics?.[subtype] || data.chosenBonusCharacteristic}
                    onChange={onChange}
                    onShowToast={onShowToast}
                />
            ))}

            {isHombreLobo && (
                <WerewolfSection
                    data={data}
                    onChange={onChange}
                />
            )}

            {isPoseido && (
                <PoseidoSection
                    poseidoParams={data.poseidoParams || { formType: null }}
                    onChange={onChange}
                />
            )}

            {isAlterado && (
                <AlteradoSection
                    alteradoParams={data.alteradoParams || { agent: null, sequels: [] }}
                    onChange={onChange}
                />
            )}

            {isMutante && (
                <MutanteSection
                    mutanteParams={data.mutanteParams || { sequels: [] }}
                    onChange={onChange}
                    data={data}
                />
            )}

            {isHibrido && (
                <HibridoSection
                    hibridoParams={data.hibridoParams || { sequels: [] }}
                    onChange={onChange}
                />
            )}

            {isGuardian && (
                <GuardianSection
                    guardianParams={data.guardianParams || { quality: null, objectType: null, feature: null, transformation: null }}
                    onChange={onChange}
                />
            )}

            {(isDios || isDiosMenor) && (
                <DivineSection
                    divineParams={data.divineParams || { focus: null }}
                    onChange={onChange}
                />
            )}

            {isMinotauro && <MinotaurSection />}

            <VigilanteTraumasSection
                vigilanteSpecialties={vigilanteSpecialties}
                traumas={data.traumas || {}}
                onUpdateTrauma={onUpdateTrauma}
            />

            {isTecnologico && (
                <TechnologicalSection
                    techParams={data.techParams}
                    onChange={(params) => onChange({ ...data, techParams: { ...(data.techParams || {}), ...params } })}
                />
            )}

            {isExoskeleton && (
                <ExoskeletonSection
                    selectedConfig={data.exoskeletonConfig || null}
                    onSelectConfig={(id) => onChange({ ...data, exoskeletonConfig: id })}
                />
            )}

            {(isTecnoarmadura || isTecnovehiculo) && (
                <ExoskeletonArmorSection
                    selectedConfig={data.exoskeletonArmorConfig || null}
                    onSelectConfig={(id) => onChange({ ...data, exoskeletonArmorConfig: id })}
                />
            )}

            {isTecnoarmadura && (
                <TechnoSuitStrengthSection
                    selectedConfig={data.technoSuitStrengthConfig || null}
                    onSelectConfig={(id) => onChange({ ...data, technoSuitStrengthConfig: id })}
                />
            )}

            {isCyborg && (
                <CyborgSection
                    implants={data.cyborgImplants || []}
                    onChange={(implants) => onChange({ ...data, cyborgImplants: implants })}
                />
            )}

            {(isTecnoarmadura || isCyborg || isTecnovehiculo) && (
                <TechModulesSection
                    techModules={techModules}
                    onOpenModal={onOpenTechModulesModal}
                    onUpdateLocation={onUpdateModuleLocation}
                    onUpdateCost={onUpdateModuleCost}
                    onRemove={onRemoveTechModule}
                />
            )}
        </>
    );
}
