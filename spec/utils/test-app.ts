import { createApp, h, type Plugin, type Ref } from 'vue';
import type { MatomoInstance } from '@/types';

type PluginWrapper = () => Plugin;

export async function useInjectedSetup<T = Ref<MatomoInstance | undefined>>(composable: () => T, plugin?: PluginWrapper) {
  let composableResult!: T;
  const app = createApp({
    setup() {
      composableResult = composable();
      return () => h('div');
    },
  });

  if (plugin) {
    const pluginInstance = plugin();
    const installResult = pluginInstance.install?.(app);
    if (installResult instanceof Promise) {
      await installResult;
    }
  }

  const div = document.createElement('div');
  app.mount(div);

  return {
    app,
    composableResult,
    unmount: () => {
      app.unmount();
      div.remove();
    },
  };
}
