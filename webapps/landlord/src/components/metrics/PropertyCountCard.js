import { useQuery } from '@tanstack/react-query';
import { observer } from 'mobx-react-lite';
import { useTranslations } from 'next-intl';
import { LuKeyRound } from 'react-icons/lu';
import { useRouter } from '@/i18n/navigation';
import { fetchPropertyCount, QueryKeys } from '../../utils/restcalls';
import { DashboardCard } from '../dashboard/DashboardCard';

function PropertyCountCard({ className }) {
  const router = useRouter();
  const t = useTranslations('common');

  const { data, isLoading, error } = useQuery({
    queryKey: [QueryKeys.PROPERTY_COUNT],
    queryFn: () => fetchPropertyCount(),
    refetchOnMount: 'always',
    retry: 3
  });

  return (
    <DashboardCard
      Icon={LuKeyRound}
      title={t('Properties')}
      description={t('Total number of properties')}
      loading={isLoading}
      renderContent={() => {
        if (error) {
          return '-';
        }
        return data?.count;
      }}
      onClick={() => {
        router.push(`/properties`);
      }}
      className={className}
    />
  );
}

export default observer(PropertyCountCard);
